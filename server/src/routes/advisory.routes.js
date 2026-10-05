import { Router } from 'express';
import {
  getAdvisories,
  getAdvisoryById,
  requestAdvisory
} from '../controllers/advisory.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { requestAdvisorySchema } from '../schemas/advisory.schema.js';

const router = Router();

router.get('/', getAdvisories);
router.get('/:id', getAdvisoryById);
router.post('/', validate(requestAdvisorySchema), requestAdvisory);

export default router;
