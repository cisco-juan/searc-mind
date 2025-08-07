import { Router } from 'express';
import { AgentController } from '../controllers/agentController.js';

const router = Router();
const agentController = new AgentController();

router.post('/query', (req, res, next) => 
  agentController.handleQuery(req, res, next)
);

router.get('/health', (req, res) => 
  agentController.handleHealth(req, res)
);

router.get('/statistics', (req, res) => 
  agentController.handleStatistics(req, res)
);

// Nuevos endpoints para manejo de documentos
router.post('/upload', agentController.getUploadMiddleware(), (req, res) =>
  agentController.handleUploadDocument(req, res)
);

router.delete('/documents', (req, res) =>
  agentController.handleClearDocuments(req, res)
);

export default router;