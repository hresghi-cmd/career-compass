import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://career-compass-2026.hresghi.chatgpt.site"),
  title: "职业天赋坐标｜18 个场景找到你的工作优势",
  description: "用 18 个真实工作场景，探索你的六类职业天赋与适合的工作方式。",
  openGraph: {
    title: "你的职业天赋，藏在哪个坐标？",
    description: "18 个真实工作场景，找到你最自然、最有能量的工作方式。",
    type: "website",
    url: "/",
    images: [{ url: "/og.png", width: 1732, height: 909, alt: "职业天赋坐标测试" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "你的职业天赋，藏在哪个坐标？",
    description: "18 个真实工作场景，找到你最自然、最有能量的工作方式。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
