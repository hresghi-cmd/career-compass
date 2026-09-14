import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccessRoute from "../../access/access-route";
import { demoAccessRecords, findDemoAccess } from "../../access/demo-access";

export const metadata: Metadata = {
  title: "专属职业天赋测试｜职业天赋坐标",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return demoAccessRecords.map(({ token }) => ({ token }));
}

export default async function AccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const access = findDemoAccess(token);
  if (!access) notFound();
  return <AccessRoute access={access} />;
}
