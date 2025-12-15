import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send a message to the chatbot API
 * @param {string} message - The user's message
 * @returns {Promise<string>} - The AI's response
 */
export const sendChatMessage = async (message) => {
  try {
    const response = await api.post('/api/chat', { message });
    return response.data.reply;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to get response');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Fetch GitHub repositories
 * @param {number} limit - Maximum number of repos to fetch
 * @returns {Promise<Array>} - Array of repository objects
 */
export const fetchGitHubRepos = async (limit = 6) => {
  try {
    const response = await api.get(`/api/github/repos?limit=${limit}`);
    return response.data.repos || [];
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch repositories');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export default api;

