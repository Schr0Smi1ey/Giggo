import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { aiService } from '../services/ai.service.js';

export const aiController = {
  analyzeCv: asyncHandler(async (req, res) => ok(res, { analysis: await aiService.analyzeCv(req.user, req.body) }, 'CV analyzed', 201)),
  latest: asyncHandler(async (req, res) => ok(res, { analysis: await aiService.latest(req.user) })),
  list: asyncHandler(async (req, res) => {
    const result = await aiService.list(req.user, req.query);
    return ok(res, { items: result.items, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / result.limit)) } });
  }),
  get: asyncHandler(async (req, res) => ok(res, { analysis: await aiService.get(req.user, req.params.id) })),
  remove: asyncHandler(async (req, res) => {
    await aiService.remove(req.user, req.params.id);
    return ok(res, null, 'Analysis deleted');
  }),
  applySkills: asyncHandler(async (req, res) => ok(res, await aiService.applySkills(req.user, req.params.id), 'Suggested skills added')),
};
