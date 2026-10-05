import { Router } from 'express';
import {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop
} from '../controllers/crop.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createCropSchema, updateCropSchema } from '../schemas/crop.schema.js';

const router = Router();

router.get('/', getCrops);
router.post('/', validate(createCropSchema), createCrop);
router.get('/:id', getCropById);
router.put('/:id', validate(updateCropSchema), updateCrop);
router.delete('/:id', deleteCrop);

export default router;
