import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';

const router = Router();
router.use(requireAuth);

const feedbackSchema = z.object({
  sessionId: z.string().uuid(),
  strengths: z.string().min(1),
  improvements: z.string().min(1),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NO_HIRE', 'STRONG_NO_HIRE']),
  notes: z.string().optional(),
});

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = feedbackSchema.parse(req.body);
    const session = await prisma.interviewSession.findUnique({ where: { id: data.sessionId } });
    if (!session) throw new ApiError(404, 'Interview session not found');

    const feedback = await prisma.feedback.upsert({
      where: { sessionId: data.sessionId },
      create: { ...data, createdById: req.userId as string },
      update: {
        strengths: data.strengths,
        improvements: data.improvements,
        recommendation: data.recommendation,
        notes: data.notes,
      },
    });

    if (session.status !== 'COMPLETED') {
      await prisma.interviewSession.update({ where: { id: data.sessionId }, data: { status: 'COMPLETED' } });
    }

    res.status(201).json(feedback);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const feedback = await prisma.feedback.findUnique({ where: { id: req.params.id } });
    if (!feedback) throw new ApiError(404, 'Feedback not found');
    res.json(feedback);
  })
);

export default router;