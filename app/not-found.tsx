import Link from "next/link";

export default function NotFound() {
  return (
    <main className="access-shell access-revoked">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="access-frame">
        <div className="access-brand"><span className="brand-mark">C</span><span>职业天赋坐标</span><em>专属测试</em></div>
        <section className="access-error" aria-labelledby="invalid-link-title">
          <div className="access-error-mark" aria-hidden="true">?</div>
          <p className="access-eyebrow">没有找到对应的测试资格</p>
          <h1 id="invalid-link-title">链接似乎不完整</h1>
          <p>请确认整条专属链接已经完整复制。你也可以回到购买平台，重新打开自动发货消息中的原链接。</p>
          <div className="access-help"><strong>仍然无法打开？</strong><p>请把订单编号发给购买平台的店铺客服，我们会核对并补发正确链接。</p></div>
          <Link href="/" className="access-secondary">返回网站首页</Link>
        </section>
        <footer className="access-footer">职业天赋坐标 · 请勿把订单信息发送给陌生人</footer>
      </div>
    </main>
  );
}
