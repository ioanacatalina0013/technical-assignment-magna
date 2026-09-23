import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';

const router = Router();
router.use(requireAuth);

const candidateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
});

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const search = (req.query.search as string) || '';
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const pageSize = Math.min(50, parseInt((req.query.pageSize as string) || '20', 10));

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { sessions: true } } },
      }),
      prisma.candidate.count({ where }),
    ]);

    res.json({ items, total, page, pageSize });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
      include: { sessions: { orderBy: { scheduledAt: 'desc' }, include: { feedback: true } } },
    });
    if (!candidate) throw new ApiError(404, 'Candidate not found');
    res.json(candidate);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = candidateSchema.parse(req.body);
    const candidate = await prisma.candidate.create({
      data: { name: data.name, email: data.email || null, notes: data.notes, createdById: req.userId as string },
    });
    res.status(201).json(candidate);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = candidateSchema.partial().parse(req.body);
    const candidate = await prisma.candidate
      .update({ where: { id: req.params.id }, data: { ...data, email: data.email || undefined } })
      .catch(() => null);
    if (!candidate) throw new ApiError(404, 'Candidate not found');
    res.json(candidate);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.candidate.delete({ where: { id: req.params.id } }).catch(() => {
      throw new ApiError(404, 'Candidate not found');
    });
    res.status(204).send();
  })
);

export default router;