import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function importWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

async function render() {
  const worker = await importWorker();
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function createFakeD1() {
  const rows = new Map();
  return {
    prepare(sql) {
      const normalized = sql.replace(/\s+/g, " ").trim();
      return {
        bind(...params) {
          return {
            async first() {
              if (!normalized.startsWith("SELECT ")) throw new Error(`Unexpected first(): ${normalized}`);
              return rows.get(params[0]) ?? null;
            },
            async run() {
              if (normalized.startsWith("INSERT OR IGNORE")) {
                const [id, tokenHash, status, createdAt, firstOpenedAt, orderReference, currentQuestion, answersJson, updatedAt] = params;
                if (!rows.has(tokenHash)) {
                  rows.set(tokenHash, {
                    id,
                    status,
                    current_question: currentQuestion,
                    answers_json: answersJson,
                    progress_version: 0,
                    order_reference: orderReference,
                    first_opened_at: firstOpenedAt,
                    updated_at: updatedAt,
                    created_at: createdAt,
                  });
                  return { meta: { changes: 1 } };
                }
                return { meta: { changes: 0 } };
              }
              if (normalized.includes("SET status = 'in_progress', first_opened_at")) {
                const [firstOpenedAt, updatedAt, tokenHash] = params;
                const row = rows.get(tokenHash);
                if (!row || row.status !== "unused") return { meta: { changes: 0 } };
                row.status = "in_progress";
                row.first_opened_at ??= firstOpenedAt;
                row.updated_at = updatedAt;
                return { meta: { changes: 1 } };
              }
              if (normalized.includes("answers_json = ?")) {
                const [answersJson, currentQuestion, updatedAt, tokenHash, baseVersion] = params;
                const row = rows.get(tokenHash);
                if (!row || !["unused", "in_progress"].includes(row.status) || row.progress_version !== baseVersion) {
                  return { meta: { changes: 0 } };
                }
                row.status = "in_progress";
                row.answers_json = answersJson;
                row.current_question = currentQuestion;
                row.progress_version += 1;
                row.updated_at = updatedAt;
                return { meta: { changes: 1 } };
              }
              throw new Error(`Unexpected run(): ${normalized}`);
            },
          };
        },
      };
    },
  };
}

test("renders the career compass shell and finished metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>职业天赋坐标/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships the complete interactive assessment", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const pkg = await readFile(new URL("../package.json", import.meta.url), "utf8");
  const fontLicense = await readFile(new URL("../public/licenses/NotoSansSC-OFL.txt", import.meta.url), "utf8");
  const displayFontLicense = await readFile(new URL("../public/licenses/NotoSerifSC-OFL.txt", import.meta.url), "utf8");
  assert.match(page, /localStorage\.setItem/);
  assert.match(page, /accessToken \? \(/);
  assert.match(page, /请打开购买后收到的专属链接/);
  assert.match(page, /普通首页只介绍测试内容，不能直接开始或重新测试/);
  assert.match(page, /onClick=\{start\}/);
  assert.match(page, /已保存到云端/);
  assert.match(page, /已保存在本机/);
  assert.match(page, /Mobile-first: render local progress immediately/);
  assert.doesNotMatch(page, /暂时无法读取测试进度/);
  assert.match(page, /另一台设备已经保存了更新进度/);
  assert.match(page, /navigator\.clipboard\.writeText/);
  assert.match(page, /AudioContext/);
  assert.match(page, /navigator\.vibrate/);
  assert.match(page, /stage === "milestone"/);
  assert.match(page, /你的独特组合/);
  assert.match(page, /role="radiogroup"/);
  assert.match(page, /intensityLabels/);
  assert.doesNotMatch(page, /键盘 A \/ B \/ C \/ D/);
  assert.match(page, /返回上一题修改/);
  assert.match(page, /修改最后一题/);
  assert.match(page, /const questions: Question\[\]/);
  assert.match(page, /计分规则与使用说明/);
  assert.match(page, /优先探索的具体岗位/);
  assert.match(page, /先试一步/);
  assert.match(page, /商务拓展经理/);
  assert.match(layout, /@fontsource-variable\/noto-sans-sc\/wght\.css/);
  assert.match(layout, /@fontsource-variable\/noto-serif-sc\/wght\.css/);
  assert.match(pkg, /@fontsource-variable\/noto-sans-sc/);
  assert.match(pkg, /@fontsource-variable\/noto-serif-sc/);
  assert.match(fontLicense, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(displayFontLicense, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.doesNotMatch(page, /↗/);
  assert.doesNotMatch(pkg, /react-loading-skeleton/);
});

test("defines the four paid-access states and demo routes", async () => {
  const accessModel = await readFile(new URL("../app/access/demo-access.ts", import.meta.url), "utf8");
  const accessPage = await readFile(new URL("../app/access/access-state-demo.tsx", import.meta.url), "utf8");
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const notFound = await readFile(new URL("../app/not-found.tsx", import.meta.url), "utf8");
  for (const state of ["unused", "in_progress", "completed", "revoked"]) {
    assert.match(accessModel, new RegExp(`status: "${state}"`));
  }
  assert.match(accessPage, /测试资格有效/);
  assert.match(accessPage, /继续你的探索/);
  assert.match(accessPage, /返回产品说明/);
  assert.match(notFound, /链接似乎不完整/);
  assert.match(schema, /tokenHash/);
  assert.match(schema, /firstOpenedAt/);
  assert.match(schema, /completedAt/);
  assert.match(schema, /orderReference/);
  assert.match(accessPage, /这份报告已经锁定/);
  assert.match(accessPage, /测试资格已失效/);
  assert.match(schema, /tokenHash/);
  assert.match(schema, /orderReference/);
  assert.match(schema, /currentQuestion/);
});

test("saves paid-link progress in D1 and rejects stale device writes", async () => {
  const worker = await importWorker();
  const database = createFakeD1();
  const endpoint = "https://career-compass-2026.hresghi.chatgpt.site/api/access/demo-unused-7m3k9p";
  const env = { DB: database };
  const ctx = { waitUntil() {}, passThroughOnException() {} };

  const preflight = await worker.fetch(new Request(endpoint, {
    method: "OPTIONS",
    headers: { Origin: "https://hresghi-cmd.github.io" },
  }), env, ctx);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), "https://hresghi-cmd.github.io");

  const opened = await worker.fetch(new Request(endpoint), env, ctx);
  assert.equal(opened.status, 200);
  const openedProgress = (await opened.json()).progress;
  assert.equal(openedProgress.status, "in_progress");
  assert.deepEqual(openedProgress.answers, []);
  assert.equal(openedProgress.current, 0);
  assert.equal(openedProgress.version, 0);

  const saved = await worker.fetch(new Request(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: [2], current: 1, baseVersion: 0 }),
  }), env, ctx);
  assert.equal(saved.status, 200);
  const savedProgress = (await saved.json()).progress;
  assert.deepEqual(savedProgress.answers, [2]);
  assert.equal(savedProgress.current, 1);
  assert.equal(savedProgress.version, 1);

  const reopened = await worker.fetch(new Request(endpoint), env, ctx);
  const reopenedProgress = (await reopened.json()).progress;
  assert.deepEqual(reopenedProgress.answers, [2]);
  assert.equal(reopenedProgress.current, 1);
  assert.equal(reopenedProgress.version, 1);

  const stale = await worker.fetch(new Request(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: [6], current: 1, baseVersion: 0 }),
  }), env, ctx);
  assert.equal(stale.status, 409);
  const staleProgress = (await stale.json()).progress;
  assert.deepEqual(staleProgress.answers, [2]);
  assert.equal(staleProgress.current, 1);
  assert.equal(staleProgress.version, 1);

  const invalid = await worker.fetch(new Request(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: [9], current: 1, baseVersion: 1 }),
  }), env, ctx);
  assert.equal(invalid.status, 400);
});
