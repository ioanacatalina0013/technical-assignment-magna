import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';

const router = Router();
router.use(requireAuth);

const sessionSchema = z.object({
  candidateId: z.string().uuid(),
  title: z.string().min(1),
  role: z.string().optional(),
  level: z.string().optional(),
  scheduledAt: z.string().datetime(),
  durationMins: z.number().int().positive().optional(),
});

const statusEnum = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const search = (req.query.search as string) || '';
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const pageSize = Math.min(50, parseInt((req.query.pageSize as string) || '20', 10));

    const where: any = {};
    if (status && statusEnum.safeParse(status).success) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { candidate: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.interviewSession.findMany({
        where,
        orderBy: { scheduledAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { candidate: true, feedback: true },
      }),
      prisma.interviewSession.count({ where }),
    ]);

    res.json({ items, total, page, pageSize });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const session = await prisma.interviewSession.findUnique({
      where: { id: req.params.id },
      include: { candidate: true, feedback: true },
    });
    if (!session) throw new ApiError(404, 'Session not found');
    res.json(session);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = sessionSchema.parse(req.body);
    const session = await prisma.interviewSession.create({
      data: { ...data, scheduledAt: new Date(data.scheduledAt), createdById: req.userId as string },
      include: { candidate: true },
    });
    res.status(201).json(session);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = sessionSchema.partial().parse(req.body);
    const session = await prisma.interviewSession
      .update({
        where: { id: req.params.id },
        data: { ...data, scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined },
        include: { candidate: true },
      })
      .catch(() => null);
    if (!session) throw new ApiError(404, 'Session not found');
    res.json(session);
  })
);

router.patch(
  '/:id/complete',
  asyncHandler(async (req, res) => {
    const session = await prisma.interviewSession
      .update({ where: { id: req.params.id }, data: { status: 'COMPLETED' } })
      .catch(() => null);
    if (!session) throw new ApiError(404, 'Session not found');
    res.json(session);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.interviewSession.delete({ where: { id: req.params.id } }).catch(() => {
      throw new ApiError(404, 'Session not found');
    });
    res.status(204).send();
  })
);

export default router;