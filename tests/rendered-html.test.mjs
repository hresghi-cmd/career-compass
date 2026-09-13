import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
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
  assert.match(page, /const PUBLIC_ENTRY_ONLY = true/);
  assert.match(page, /请打开购买后收到的专属链接/);
  assert.doesNotMatch(page, /onClick=\{start\}/);
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
