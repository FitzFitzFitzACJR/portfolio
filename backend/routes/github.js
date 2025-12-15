import express from 'express';
import ProjectsService from '../services/projects.js';

const router = express.Router();

// Lazy initialization
let projectsService = null;

const getProjectsService = () => {
  if (!projectsService) {
    projectsService = new ProjectsService();
  }
  return projectsService;
};

/**
 * GET /api/github/repos
 * Get static project data (no API calls)
 */
router.get('/github/repos', async (req, res) => {
  try {
    const service = getProjectsService();
    const projects = service.getProjects();

    res.json({
      repos: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Projects endpoint error:', error);
    
    res.status(500).json({
      error: error.message || 'Failed to get projects'
    });
  }
});

export default router;

