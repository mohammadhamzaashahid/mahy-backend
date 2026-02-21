import express from 'express';
import { createTableFromSchema, exportTableTemplate } from '../controllers/schemaController.js';

const router = express.Router();

router.post('/create', createTableFromSchema);
router.get("/export-entity-template/:tableName", exportTableTemplate);

export default router;
