import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
router.use(requireAuth);

router.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const [totalSessions, completedSessions, totalCandidates, recommendationCounts] = await Promise.all([
      prisma.interviewSession.count(),
      prisma.interviewSession.count({ where: { status: 'COMPLETED' } }),
      prisma.candidate.count(),
      prisma.feedback.groupBy({ by: ['recommendation'], _count: true }),
    ]);

    res.json({
      totalSessions,
      completedSessions,
      completionRate: totalSessions ? completedSessions / totalSessions : 0,
      totalCandidates,
      recommendationBreakdown: recommendationCounts.map((r) => ({
        recommendation: r.recommendation,
        count: r._count,
      })),
    });
  })
);

router.get(
  '/trend',
  asyncHandler(async (req, res) => {
    const weeks = Math.min(26, parseInt((req.query.weeks as string) || '8', 10));
    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);

    const sessions = await prisma.interviewSession.findMany({
      where: { scheduledAt: { gte: since } },
      select: { scheduledAt: true, status: true },
    });

    const buckets = new Map<string, number>();
    for (const s of sessions) {
      const d = new Date(s.scheduledAt);
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    const trend = Array.from(buckets.entries())
      .map(([weekStart, count]) => ({ weekStart, count }))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    res.json({ trend });
  })
);

export default router;