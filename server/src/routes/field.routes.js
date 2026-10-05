import { Router } from 'express';
import {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField
} from '../controllers/field.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createFieldSchema, updateFieldSchema } from '../schemas/field.schema.js';

const router = Router();

router.get('/', getFields);
router.post('/', validate(createFieldSchema), createField);
router.get('/:id', getFieldById);
router.put('/:id', validate(updateFieldSchema), updateField);
router.delete('/:id', deleteField);

export default router;
