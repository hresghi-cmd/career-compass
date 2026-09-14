type AccessStatus = "unused" | "in_progress" | "completed" | "revoked";

type AccessRow = {
  id: string;
  status: AccessStatus;
  current_question: number;
  answers_json: string;
  progress_version: number;
  order_reference: string | null;
  first_opened_at: number | null;
  updated_at: number | null;
};

type ProgressPayload = {
  answers?: unknown;
  current?: unknown;
  baseVersion?: unknown;
};

const DEMO_SEEDS: Record<string, { status: AccessStatus; answers: number[]; current: number; orderReference: string }> = {
  "demo-unused-7m3k9p": { status: "unused", answers: [], current: 0, orderReference: "DEMO-0001" },
  "demo-progress-4x8n2q": { status: "in_progress", answers: [1, 4, 2, 5, 3], current: 5, orderReference: "DEMO-0002" },
};

const allowedOrigins = new Set([
  "https://hresghi-cmd.github.io",
  "https://career-compass-2026.hresghi.chatgpt.site",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin");
  const headers = new Headers({ "Cache-Control": "no-store", "Vary": "Origin" });
  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  return headers;
}

function json(request: Request, body: unknown, status = 200) {
  const headers = corsHeaders(request);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parseAnswers(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 6)) {
      return parsed as number[];
    }
  } catch { /* Invalid stored data is handled as an empty recoverable progress snapshot. */ }
  return [];
}

function publicProgress(row: AccessRow) {
  return {
    status: row.status,
    answers: parseAnswers(row.answers_json),
    current: row.current_question,
    version: row.progress_version,
    orderReference: row.order_reference,
    firstOpenedAt: row.first_opened_at,
    updatedAt: row.updated_at,
  };
}

async function ensureDemoAccess(database: D1Database, token: string, tokenHash: string) {
  const seed = DEMO_SEEDS[token];
  if (!seed) return false;
  const now = Date.now();
  await database.prepare(`
    INSERT OR IGNORE INTO assessment_access
      (id, token_hash, status, created_at, first_opened_at, order_reference, current_question, answers_json, progress_version, updated_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'demo')
  `).bind(
    crypto.randomUUID(), tokenHash, seed.status, now,
    seed.status === "in_progress" ? now : null,
    seed.orderReference, seed.current, JSON.stringify(seed.answers), now,
  ).run();
  return true;
}

async function readAccess(database: D1Database, tokenHash: string) {
  return database.prepare(`
    SELECT id, status, current_question, answers_json, progress_version,
           order_reference, first_opened_at, updated_at
    FROM assessment_access
    WHERE token_hash = ?
    LIMIT 1
  `).bind(tokenHash).first<AccessRow>();
}

function validProgressPayload(payload: ProgressPayload) {
  return Array.isArray(payload.answers)
    && payload.answers.length <= 18
    && payload.answers.every((answer) => Number.isInteger(answer) && (answer as number) >= 0 && (answer as number) <= 6)
    && Number.isInteger(payload.current)
    && (payload.current as number) >= 0
    && (payload.current as number) <= 18
    && Number.isInteger(payload.baseVersion)
    && (payload.baseVersion as number) >= 0;
}

export async function handleAccessApi(request: Request, database: D1Database, token: string) {
  if (request.method === "OPTIONS") {
    const headers = corsHeaders(request);
    headers.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers });
  }

  if (!/^[A-Za-z0-9_-]{12,120}$/.test(token)) {
    return json(request, { error: "链接格式不正确" }, 404);
  }

  const tokenHash = await hashToken(token);
  await ensureDemoAccess(database, token, tokenHash);
  let row = await readAccess(database, tokenHash);
  if (!row) return json(request, { error: "没有找到对应的测试资格" }, 404);
  if (row.status === "revoked") return json(request, { error: "测试资格已撤销" }, 403);
  if (row.status === "completed") return json(request, { progress: publicProgress(row) });

  if (request.method === "GET") {
    if (row.status === "unused") {
      const now = Date.now();
      await database.prepare(`
        UPDATE assessment_access
        SET status = 'in_progress', first_opened_at = COALESCE(first_opened_at, ?), updated_at = ?
        WHERE token_hash = ? AND status = 'unused'
      `).bind(now, now, tokenHash).run();
      row = (await readAccess(database, tokenHash)) ?? row;
    }
    return json(request, { progress: publicProgress(row) });
  }

  if (request.method !== "PATCH") {
    return json(request, { error: "不支持这个操作" }, 405);
  }

  let payload: ProgressPayload;
  try {
    payload = await request.json() as ProgressPayload;
  } catch {
    return json(request, { error: "保存内容格式不正确" }, 400);
  }
  if (!validProgressPayload(payload)) {
    return json(request, { error: "答题进度不完整或包含无效选项" }, 400);
  }

  const now = Date.now();
  const result = await database.prepare(`
    UPDATE assessment_access
    SET status = 'in_progress', answers_json = ?, current_question = ?,
        progress_version = progress_version + 1, updated_at = ?
    WHERE token_hash = ? AND status IN ('unused', 'in_progress') AND progress_version = ?
  `).bind(
    JSON.stringify(payload.answers), payload.current, now, tokenHash, payload.baseVersion,
  ).run();

  if ((result.meta?.changes ?? 0) === 0) {
    const latest = await readAccess(database, tokenHash);
    if (!latest) return json(request, { error: "测试资格不存在" }, 404);
    return json(request, {
      error: "另一台设备或页面已经保存了更新的进度",
      progress: publicProgress(latest),
    }, 409);
  }

  const updated = await readAccess(database, tokenHash);
  if (!updated) return json(request, { error: "保存后无法读取进度" }, 500);
  return json(request, { progress: publicProgress(updated) });
}
