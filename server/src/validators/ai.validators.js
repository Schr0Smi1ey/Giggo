import { z } from 'zod';

const analysisIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid analysis id');

export const analyzeCvSchema = z.object({
  text: z.string().trim().min(30).max(60000).optional(),
  force: z.coerce.boolean().optional().default(false),
}).strict();

export const validateAiQuery = (req, _response, next) => {
  const result = z.object({ page: z.coerce.number().int().min(1).optional(), limit: z.coerce.number().int().min(1).max(50).optional() }).strict().safeParse(req.query);
  if (!result.success) return next(result.error);
  req.query = result.data;
  return next();
};

export const validateAnalysisId = (req, _response, next) => {
  const result = analysisIdSchema.safeParse(req.params.id);
  if (!result.success) return next(result.error);
  return next();
};
