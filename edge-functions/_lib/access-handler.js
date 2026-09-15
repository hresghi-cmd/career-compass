import { calculateAssessmentReport } from "./assessment.js";

const DEMO_SEEDS = {
  "demo-unused-7m3k9p": { status: "unused", answers: [], current: 0, orderReference: "DEMO-0001" },
  "demo-progress-4x8n2q": { status: "in_progress", answers: [1, 4, 2, 5, 3], current: 5, orderReference: "DEMO-0002" },
  "demo-finalize-8k2m4x": { status: "unused", answers: [], current: 0, orderReference: "DEMO-0005" },
  "demo-edge-finalize-6r9p2w": { status: "unused", answers: [], current: 0, orderReference: "DEMO-0006" },
};

const allowedOrigins = new Set([
  "https://hresghi-cmd.github.io",
  "https://career-compass-2026.hresghi.chatgpt.site",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  const headers = new Headers({ "Cache-Control": "no-store", Vary: "Origin" });
  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, PATCH, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  return headers;
}

function json(request, body, status = 200) {
  const headers = corsHeaders(request);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

async function hashToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validAnswers(value, exact = false) {
  return Array.isArray(value)
    && (exact ? value.length === 18 : value.length <= 18)
    && value.every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 6);
}

function validProgressPayload(payload) {
  return payload && validAnswers(payload.answers)
    && Number.isInteger(payload.current) && payload.current >= 0 && payload.current <= 18
    && Number.isInteger(payload.baseVersion) && payload.baseVersion >= 0;
}

function publicProgress(record) {
  return {
    status: record.status,
    answers: record.answers,
    current: record.current,
    version: record.version,
    orderReference: record.orderReference,
    firstOpenedAt: record.firstOpenedAt,
    updatedAt: record.updatedAt,
    completedAt: record.completedAt ?? null,
    report: record.report ?? null,
  };
}

async function readJson(store, key) {
  return store.get(key, { type: "json", consistency: "strong" });
}

async function ensureSeed(progressStore, token, tokenHash) {
  const seed = DEMO_SEEDS[token];
  if (!seed) return null;
  const key = `access/${tokenHash}.json`;
  const existing = await readJson(progressStore, key);
  if (existing) return existing;
  const now = Date.now();
  const record = {
    ...seed,
    version: 0,
    firstOpenedAt: seed.status === "in_progress" ? now : null,
    updatedAt: now,
  };
  try { await progressStore.setJSON(key, record, { onlyIfNew: true }); }
  catch { /* A simultaneous first request may have created the same seed. */ }
  return (await readJson(progressStore, key)) ?? record;
}

export function createAccessHandler({ progressStore, reportStore }) {
  return async function handleAccessRequest(request) {
    if (request.method === "OPTIONS") {
      const headers = corsHeaders(request);
      headers.set("Access-Control-Max-Age", "86400");
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/access\/([^/]+)(\/complete)?\/?$/);
    if (!match) return json(request, { error: "接口路径不正确" }, 404);
    const token = decodeURIComponent(match[1]);
    const isComplete = Boolean(match[2]);
    if (!/^[A-Za-z0-9_-]{12,120}$/.test(token)) return json(request, { error: "链接格式不正确" }, 404);

    const tokenHash = await hashToken(token);
    const accessKey = `access/${tokenHash}.json`;
    const reportKey = `reports/${tokenHash}.json`;
    const completed = await readJson(reportStore, reportKey);
    if (completed) {
      if (request.method === "GET" || (isComplete && request.method === "POST")) {
        return json(request, { progress: publicProgress(completed) });
      }
      return json(request, { error: "这份报告已经锁定，不能再修改答案", progress: publicProgress(completed) }, 409);
    }

    let record = await readJson(progressStore, accessKey);
    if (!record) record = await ensureSeed(progressStore, token, tokenHash);
    if (!record) return json(request, { error: "没有找到对应的测试资格" }, 404);
    if (record.status === "revoked") return json(request, { error: "测试资格已撤销" }, 403);

    if (isComplete) {
      if (request.method !== "POST") return json(request, { error: "不支持这个操作" }, 405);
      let payload;
      try { payload = await request.json(); }
      catch { return json(request, { error: "最终答案格式不正确" }, 400); }
      if (!validProgressPayload(payload) || !validAnswers(payload.answers, true) || payload.current !== 18) {
        return json(request, { error: "请完成全部 18 题后再生成报告" }, 400);
      }

      const now = Date.now();
      const finalRecord = {
        status: "completed",
        answers: payload.answers,
        current: 18,
        version: Math.max(record.version + 1, payload.baseVersion + 1),
        orderReference: record.orderReference,
        firstOpenedAt: record.firstOpenedAt ?? now,
        updatedAt: now,
        completedAt: now,
        report: calculateAssessmentReport(payload.answers),
      };
      try { await reportStore.setJSON(reportKey, finalRecord, { onlyIfNew: true }); }
      catch { /* The first simultaneous submission owns the immutable report. */ }
      const locked = await readJson(reportStore, reportKey);
      if (!locked) return json(request, { error: "报告锁定失败，请重试" }, 503);
      return json(request, { progress: publicProgress(locked) });
    }

    if (request.method === "GET") {
      if (record.status === "unused") {
        const now = Date.now();
        record = { ...record, status: "in_progress", firstOpenedAt: record.firstOpenedAt ?? now, updatedAt: now };
        await progressStore.setJSON(accessKey, record);
      }
      return json(request, { progress: publicProgress(record) });
    }

    if (request.method !== "PATCH") return json(request, { error: "不支持这个操作" }, 405);
    let payload;
    try { payload = await request.json(); }
    catch { return json(request, { error: "保存内容格式不正确" }, 400); }
    if (!validProgressPayload(payload)) return json(request, { error: "答题进度不完整或包含无效选项" }, 400);

    if (payload.baseVersion !== record.version) {
      return json(request, { error: "另一台设备或页面已经保存了更新的进度", progress: publicProgress(record) }, 409);
    }
    const now = Date.now();
    const updated = {
      ...record,
      status: "in_progress",
      answers: payload.answers,
      current: payload.current,
      version: record.version + 1,
      firstOpenedAt: record.firstOpenedAt ?? now,
      updatedAt: now,
    };
    await progressStore.setJSON(accessKey, updated);
    return json(request, { progress: publicProgress(updated) });
  };
}

