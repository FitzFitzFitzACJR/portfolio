import express from 'express';
import FlowiseService from '../services/flowise.js';

const router = express.Router();

// Lazy initialization - only create service when needed
let flowiseService = null;

const getFlowiseService = () => {
  if (!flowiseService) {
    flowiseService = new FlowiseService();
  }
  return flowiseService;
};

/**
 * POST /api/chat
 * Handle chat messages and return AI responses
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    const service = getFlowiseService();
    const chatHistory = Array.isArray(history) ? history : [];
    const reply = await service.getChatResponse(message.trim(), chatHistory);

    res.json({
      reply
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

export default router;

