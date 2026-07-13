import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess } from "../utils/response";
import { getCurrentOverdueThresholdDays } from "./settingsController";

// Admin dashboard: counts by status, by category, and overdue count.
// All aggregation is done via SQL GROUP BY (Prisma's groupBy), not by pulling
// every row and counting in JS — keeps this fast even as complaint volume grows.
export async function getDashboard(_req: Request, res: Response) {
  const [statusCounts, categoryCounts, total, thresholdDays] = await Promise.all([
    prisma.complaint.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.complaint.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
    prisma.complaint.count(),
    getCurrentOverdueThresholdDays(),
  ]);

  const thresholdDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

  // Overdue count still needs a row-level condition (status IN + createdAt cutoff),
  // so this one query can't be a plain groupBy — but it's still a single COUNT
  // query at the DB level, not an in-memory count.
  const overdueCount = await prisma.complaint.count({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      createdAt: { lt: thresholdDate },
    },
  });

  const byStatus: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
  statusCounts.forEach((row) => {
    byStatus[row.status] = row._count._all;
  });

  const byCategory: Record<string, number> = {};
  categoryCounts.forEach((row) => {
    byCategory[row.category] = row._count._all;
  });

  return sendSuccess(res, {
    total,
    byStatus,
    byCategory,
    overdueCount,
    overdueThresholdDays: thresholdDays,
  });
}
