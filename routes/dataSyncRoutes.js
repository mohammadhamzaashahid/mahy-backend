import express from 'express';
import { syncDataEntity } from '../controllers/dataSyncController.js';

const router = express.Router();
//to use
// /api/sync?entity=OperationalSitesV2&table=sites
router.get('/', syncDataEntity);

export default router;
