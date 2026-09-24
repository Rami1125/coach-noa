/**
 * Next.js App Router API Route: /api/coach/audit
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Executes autonomous daily Meta-Prompting audit with Gemini 3.8 Flash
 * and saves report into 'noa_daily_audits'.
 */

import { NextResponse } from "next/server";
import { runAutonomousDailyAudit, getHistoricalAudits } from "@/lib/audit-engine";
import { getSystemHealthSnapshot } from "@/lib/noa-observer";

export const dynamic = "force-dynamic";

/**
 * Trigger new autonomous daily audit
 */
export async function POST() {
  try {
    const auditReport = await runAutonomousDailyAudit();
    return NextResponse.json({
      success: true,
      report: auditReport,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[API /api/coach/audit] Error executing audit:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute daily autonomous audit"
      },
      { status: 500 }
    );
  }
}

/**
 * Get latest health snapshot and historical audits
 */
export async function GET() {
  try {
    const [health, historical] = await Promise.all([
      getSystemHealthSnapshot(),
      getHistoricalAudits(5)
    ]);

    return NextResponse.json({
      success: true,
      health,
      historicalAudits: historical,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[API /api/coach/audit] Error fetching audits data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch audit data"
      },
      { status: 500 }
    );
  }
}
