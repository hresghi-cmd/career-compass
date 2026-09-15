import { getStore } from "@edgeone/pages-blob";
import { createAccessHandler } from "../../_lib/access-handler.js";

export default function onRequest(context) {
  const handler = createAccessHandler({
    progressStore: getStore({ name: "career-compass-progress", consistency: "strong" }),
    reportStore: getStore({ name: "career-compass-reports", consistency: "strong" }),
  });
  return handler(context.request);
}
