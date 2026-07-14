/** Usage/cost logging. CPU-first launch: costs are dominated by CPU-seconds
 * (≈$0 on own hardware; priced here at a small cloud-VM equivalent so the
 * dashboard stays honest if deployed), Gemini tokens, and storage bytes. */
import { getDb, schema } from "@/db/client";

// Reference prices (USD). Adjust in one place.
export const PRICES = {
  cpuSecond: 0.000014, // ~4-vCPU cloud VM equivalent
  geminiFlashLiteInputPerMTokens: 0.1,
  geminiFlashLiteOutputPerMTokens: 0.4,
  geminiFlashInputPerMTokens: 0.3,
  geminiFlashOutputPerMTokens: 2.5,
  storageGbMonth: 0.021,
};

export async function logUsage(
  projectId: string | null,
  kind: string,
  quantity: number,
  unit: string,
  estimatedCostUsd: number,
  meta?: unknown,
) {
  const db = await getDb();
  await db.insert(schema.usageEvents).values({
    projectId,
    kind,
    quantity,
    unit,
    estimatedCostUsd,
    meta: meta ?? null,
  });
}

export function geminiCost(model: string, inputTokens: number, outputTokens: number): number {
  const lite = model.includes("lite");
  const inP = lite ? PRICES.geminiFlashLiteInputPerMTokens : PRICES.geminiFlashInputPerMTokens;
  const outP = lite ? PRICES.geminiFlashLiteOutputPerMTokens : PRICES.geminiFlashOutputPerMTokens;
  return (inputTokens / 1e6) * inP + (outputTokens / 1e6) * outP;
}
