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
  const pkg = await readFile(new URL("../package.json", import.meta.url), "utf8");
  assert.match(page, /localStorage\.setItem/);
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
  assert.doesNotMatch(page, /↗/);
  assert.doesNotMatch(pkg, /react-loading-skeleton/);
});
