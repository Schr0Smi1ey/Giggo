import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ROLES } from '../models/User.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { aiController } from '../controllers/ai.controller.js';
import { analyzeCvSchema, validateAiQuery, validateAnalysisId } from '../validators/ai.validators.js';

const router = Router();
const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

router.use(requireAuth, requireRole(ROLES.FREELANCER));
router.post('/cv/analyze', aiLimiter, validate(analyzeCvSchema), aiController.analyzeCv);
router.get('/cv/latest', aiController.latest);
router.get('/cv/analyses', validateAiQuery, aiController.list);
router.get('/cv/analyses/:id', validateAnalysisId, aiController.get);
router.delete('/cv/analyses/:id', validateAnalysisId, aiController.remove);
router.post('/cv/analyses/:id/apply-skills', validateAnalysisId, aiController.applySkills);

export default router;
