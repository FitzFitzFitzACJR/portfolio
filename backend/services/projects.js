/**
 * Projects Service
 * Returns static project data based on GitHub profile
 */
class ProjectsService {
  constructor() {
    this.githubUrl = process.env.GITHUB_PROFILE_URL || 'https://github.com/FitzFitzFitz69';
    this.githubUsername = this.extractUsername(this.githubUrl);
  }

  /**
   * Extract username from GitHub URL
   */
  extractUsername(url) {
    if (!url) return 'FitzFitzFitz69';
    
    try {
      const match = url.match(/github\.com\/([^\/]+)/);
      return match ? match[1] : 'FitzFitzFitz69';
    } catch (error) {
      return 'FitzFitzFitz69';
    }
  }

  /**
   * Get static projects based on GitHub profile
   * @returns {Array} - Array of project objects
   */
  getProjects() {
    const baseUrl = `https://github.com/${this.githubUsername}`;
    
    return [
      {
        id: 1,
        name: 'js-review-project',
        description: 'JavaScript review project showcasing fundamental JS concepts and best practices.',
        url: `${baseUrl}/js-review-project`,
        languages: ['JavaScript'],
        status: 'Active'
      },
      {
        id: 2,
        name: 'javascript-review-project-2',
        description: 'Advanced JavaScript concepts and project implementation.',
        url: `${baseUrl}/javascript-review-project-2`,
        languages: ['JavaScript', 'CSS'],
        status: 'Active'
      },
      {
        id: 3,
        name: 'LogReg',
        description: 'Login and registration system implementation.',
        url: `${baseUrl}/LogReg`,
        languages: ['JavaScript', 'HTML', 'CSS'],
        status: 'Active'
      },
      {
        id: 4,
        name: 'intro_nodejs_express',
        description: 'Introduction to Node.js and Express.js framework for backend development.',
        url: `${baseUrl}/intro_nodejs_express`,
        languages: ['JavaScript', 'HTML', 'Node.js', 'Express'],
        status: 'Active'
      },
      {
        id: 5,
        name: 'SysArch-SitInMonitoringSystem',
        description: 'CCS Sit-in Monitoring System - System Architecture project for monitoring and tracking.',
        url: `${baseUrl}/SysArch-SitInMonitoringSystem`,
        languages: ['PHP', 'JavaScript', 'HTML', 'CSS'],
        status: 'Active'
      },
      {
        id: 6,
        name: 'Act4-Rest-API',
        description: 'RESTful API implementation using TypeScript for building scalable backend services.',
        url: `${baseUrl}/Act4-Rest-API`,
        languages: ['TypeScript', 'Node.js', 'Express'],
        status: 'Active'
      }
    ];
  }
}

export default ProjectsService;


