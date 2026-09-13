"use client";

import Link from "next/link";
import { useState } from "react";
import type { DemoAccess } from "./demo-access";

const previewQuestions = {
  0: {
    scene: "面对未知",
    prompt: "收到一个方向模糊的新任务时，我通常会……",
    left: ["先看清问题", "收集信息，找到关键"],
    right: ["先动手试试", "做出雏形，再找方向"],
  },
  5: {
    scene: "表达成果",
    prompt: "让别人理解一个想法时，我更擅长……",
    left: ["创造画面", "用新鲜方式讲出来"],
    right: ["带动认同", "让人愿意相信和行动"],
  },
} as const;

const scaleLabels = ["非常符合左侧", "比较符合左侧", "稍微符合左侧", "两边都符合", "稍微符合右侧", "比较符合右侧", "非常符合右侧"];

function Brand() {
  return (
    <div className="access-brand">
      <span className="brand-mark">C</span>
      <span>职业天赋坐标</span>
      <em>专属测试</em>
    </div>
  );
}

function AccessQuestion({ questionIndex }: { questionIndex: 0 | 5 }) {
  const [choice, setChoice] = useState<number | null>(questionIndex === 5 ? 4 : null);
  const question = previewQuestions[questionIndex];

  return (
    <section className="access-question" aria-labelledby="access-question-title">
      <header className="access-question-header">
        <span>探索进度</span>
        <strong>{String(questionIndex + 1).padStart(2, "0")} / 18</strong>
      </header>
      <div className="access-progress"><span style={{ width: `${((questionIndex + 1) / 18) * 100}%` }} /></div>
      <div className="access-question-copy">
        <p>第 {String(questionIndex + 1).padStart(2, "0")} 题 · {question.scene}</p>
        <h1 id="access-question-title">{question.prompt}</h1>
      </div>
      <div className="access-scale-card">
        <div className="access-poles">
          <div><span>左侧倾向</span><strong>{question.left[0]}</strong><p>{question.left[1]}</p></div>
          <div><span>右侧倾向</span><strong>{question.right[0]}</strong><p>{question.right[1]}</p></div>
        </div>
        <div className="access-scale" role="radiogroup" aria-label="选择更接近你的程度">
          {scaleLabels.map((label, index) => (
            <button key={label} type="button" role="radio" aria-label={label} aria-checked={choice === index} className={choice === index ? "selected" : ""} onClick={() => setChoice(index)}>
              <span>{choice === index ? "✓" : ""}</span>
              <small>{index === 0 || index === 6 ? "非常符合" : index === 3 ? "都符合" : ""}</small>
            </button>
          ))}
        </div>
        <p className="access-scale-note" aria-live="polite">{choice === null ? "选择最接近你的程度" : scaleLabels[choice]}</p>
      </div>
      <div className="access-prototype-note"><span>阶段 1 原型</span>此处用于确认链接能进入正确进度；答案跨设备保存将在阶段 2 接通。</div>
    </section>
  );
}

function UnusedAccess({ access }: { access: DemoAccess }) {
  const [started, setStarted] = useState(false);
  if (started) return <AccessQuestion questionIndex={0} />;

  return (
    <section className="access-welcome" aria-labelledby="access-welcome-title">
      <div className="access-status-pill"><span /> 测试资格有效</div>
      <p className="access-eyebrow">一场关于工作方式的自我勘探</p>
      <h1 id="access-welcome-title">你的专属职业天赋<br /><em>探索已经准备好</em></h1>
      <p className="access-lead">18 道轻量选择题，约 2 分钟完成。最终生成报告前，可以返回、退出并继续作答。</p>
      <button className="access-primary" onClick={() => setStarted(true)}>开始测试 <span>→</span></button>
      <div className="access-meta"><span>18 道题</span><span>7 级倾向</span><span>仅生成 1 份报告</span></div>
      <small>资格编号 {access.orderReference}</small>
    </section>
  );
}

function ProgressAccess({ access }: { access: DemoAccess }) {
  const [continued, setContinued] = useState(false);
  if (continued) return <AccessQuestion questionIndex={5} />;
  const done = access.currentQuestion;

  return (
    <section className="access-resume" aria-labelledby="access-resume-title">
      <div className="access-resume-orbit" aria-hidden="true"><span>{done}</span><small>/ 18</small></div>
      <p className="access-eyebrow">已为你保留答题位置</p>
      <h1 id="access-resume-title">欢迎回来，继续你的探索</h1>
      <p>你已经完成前 {done} 题。打开同一条专属链接，会回到尚未作答的第 {done + 1} 题。</p>
      <div className="access-resume-progress"><span style={{ width: `${(done / 18) * 100}%` }} /></div>
      <button className="access-primary" onClick={() => setContinued(true)}>从第 {done + 1} 题继续 <span>→</span></button>
      <small>最终提交前仍可返回修改之前的答案</small>
    </section>
  );
}

function CompletedAccess() {
  return (
    <section className="access-report" aria-labelledby="access-report-title">
      <div className="access-report-label"><span>报告已生成</span><em>只读保存</em></div>
      <div className="access-report-hero">
        <span className="access-report-symbol">∞</span>
        <p>你的主天赋 · 影响</p>
        <h1 id="access-report-title">共振推动者</h1>
        <strong>让想法被听见，让人愿意行动</strong>
        <blockquote>“你真正擅长的不是说服，而是让不同的人愿意朝同一个方向走。”</blockquote>
      </div>
      <div className="access-report-grid">
        <article><span>01</span><h2>主天赋</h2><strong>影响</strong><p>建立信任、翻译复杂观点，并推动共识。</p></article>
        <article><span>02</span><h2>第二天赋</h2><strong>行动</strong><p>在真实反馈里快速找到可行路径。</p></article>
        <article className="wide"><span>03</span><h2>优先探索</h2><div><b>商务拓展经理</b><b>品牌传播策划</b><b>社群增长运营</b></div></article>
      </div>
      <div className="access-lock-note"><span>✓</span><div><strong>这份报告已经锁定</strong><p>再次打开原专属链接，仍会看到同一份结果，不会重新进入答题。</p></div></div>
    </section>
  );
}

function RevokedAccess({ access }: { access: DemoAccess }) {
  return (
    <section className="access-error" aria-labelledby="access-error-title">
      <div className="access-error-mark" aria-hidden="true">×</div>
      <p className="access-eyebrow">这条链接暂时无法使用</p>
      <h1 id="access-error-title">测试资格已失效</h1>
      <p>可能是订单已退款、链接被撤销，或地址复制不完整。你的设备和浏览器没有问题。</p>
      <div className="access-help"><strong>需要帮助？</strong><p>请把资格编号 <b>{access.orderReference}</b> 发给购买平台的店铺客服，我们会协助核对。</p></div>
      <Link href="/" className="access-secondary">返回产品说明</Link>
    </section>
  );
}

export default function AccessStateDemo({ access }: { access: DemoAccess }) {
  return (
    <main className={`access-shell access-${access.status}`}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="access-frame">
        <Brand />
        {access.status === "unused" && <UnusedAccess access={access} />}
        {access.status === "in_progress" && <ProgressAccess access={access} />}
        {access.status === "completed" && <CompletedAccess />}
        {access.status === "revoked" && <RevokedAccess access={access} />}
        <footer className="access-footer">职业天赋坐标 · 专属访问凭证请勿转发</footer>
      </div>
    </main>
  );
}
