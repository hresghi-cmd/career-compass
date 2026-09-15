export type AccessStatus = "unused" | "in_progress" | "completed" | "revoked";

export type DemoAccess = {
  token: string;
  status: AccessStatus;
  createdAt: string;
  firstOpenedAt: string | null;
  completedAt: string | null;
  orderReference: string;
  currentQuestion: number;
};

export const demoAccessRecords = [
  {
    token: "demo-unused-7m3k9p",
    status: "unused",
    createdAt: "2026-09-13T09:00:00+08:00",
    firstOpenedAt: null,
    completedAt: null,
    orderReference: "DEMO-0001",
    currentQuestion: 0,
  },
  {
    token: "demo-progress-4x8n2q",
    status: "in_progress",
    createdAt: "2026-09-13T09:10:00+08:00",
    firstOpenedAt: "2026-09-13T09:13:00+08:00",
    completedAt: null,
    orderReference: "DEMO-0002",
    currentQuestion: 5,
  },
  {
    token: "demo-completed-9c5v7r",
    status: "completed",
    createdAt: "2026-09-13T09:20:00+08:00",
    firstOpenedAt: "2026-09-13T09:22:00+08:00",
    completedAt: "2026-09-13T09:28:00+08:00",
    orderReference: "DEMO-0003",
    currentQuestion: 18,
  },
  {
    token: "demo-revoked-2f6w8h",
    status: "revoked",
    createdAt: "2026-09-13T09:30:00+08:00",
    firstOpenedAt: null,
    completedAt: null,
    orderReference: "DEMO-0004",
    currentQuestion: 0,
  },
  {
    token: "demo-finalize-8k2m4x",
    status: "unused",
    createdAt: "2026-09-15T10:00:00+08:00",
    firstOpenedAt: null,
    completedAt: null,
    orderReference: "DEMO-0005",
    currentQuestion: 0,
  },
  {
    token: "demo-edge-finalize-6r9p2w",
    status: "unused",
    createdAt: "2026-09-15T23:30:00+08:00",
    firstOpenedAt: null,
    completedAt: null,
    orderReference: "DEMO-0006",
    currentQuestion: 0,
  },
] satisfies DemoAccess[];

export function findDemoAccess(token: string) {
  return demoAccessRecords.find((record) => record.token === token) ?? null;
}
