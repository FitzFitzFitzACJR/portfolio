import axios from 'axios';

/**
 * Flowise AI API Service
 * Handles communication with Flowise AI chatflow API
 */
class FlowiseService {
  constructor() {
    this.apiKey = process.env.FLOWISE_API_KEY;
    this.apiUrl = process.env.FLOWISE_API_URL;
    this.chatflowId = process.env.FLOWISE_CHATFLOW_ID;
    
    // If FLOWISE_API_URL is not provided, construct it from chatflow ID
    if (!this.apiUrl && this.chatflowId) {
      // Default to Flowise Cloud, but can be overridden
      const baseUrl = process.env.FLOWISE_BASE_URL || 'https://cloud.flowise.ai';
      this.apiUrl = `${baseUrl}/api/v1/prediction/${this.chatflowId}`;
    }

    // Fix common URL mistakes
    if (this.apiUrl) {
      // Fix .com to .ai
      if (this.apiUrl.includes('cloud.flowise.com')) {
        this.apiUrl = this.apiUrl.replace('cloud.flowise.com', 'cloud.flowise.ai');
        console.warn('Fixed Flowise URL: changed .com to .ai');
      }
    }
  }

  /**
   * Check if API is configured
   */
  isConfigured() {
    return !!(this.apiUrl || this.chatflowId);
  }

  /**
   * Send message to Flowise chatflow and get AI response
   * @param {string} userMessage - The user's message
   * @param {Array} history - Chat history (optional)
   * @returns {Promise<string>} - The AI's response
   */
  async getChatResponse(userMessage, history = []) {
    if (!this.isConfigured()) {
      throw new Error('Flowise API is not configured. Please set FLOWISE_API_URL or FLOWISE_CHATFLOW_ID in environment variables.');
    }

    if (!this.apiUrl) {
      throw new Error('FLOWISE_API_URL is required. Please set it in your .env file.');
    }

    try {
      const requestBody = {
        question: userMessage,
        history: history,
        overrideConfig: {}
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      // Add API key if provided
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.post(
        this.apiUrl,
        requestBody,
        {
          headers,
          timeout: 30000, // 30 second timeout
          validateStatus: function (status) {
            return status < 500; // Don't throw for 4xx errors, we'll handle them
          }
        }
      );

      // Check if response is HTML (wrong endpoint)
      const responseData = response.data;
      const responseString = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
      
      if (responseString.includes('<!DOCTYPE html>') || responseString.includes('<html')) {
        console.error('Flowise returned HTML instead of JSON. Check your API URL:', this.apiUrl);
        throw new Error(
          'Flowise API returned HTML instead of JSON. This usually means:\n' +
          '1. The API URL is incorrect (pointing to Flowise UI instead of API endpoint)\n' +
          '2. The chatflow ID is wrong\n' +
          '3. The endpoint format is incorrect\n\n' +
          `Current URL: ${this.apiUrl}\n` +
          'Expected format: https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id'
        );
      }

      // Check response status
      if (response.status >= 400) {
        const errorMsg = responseData?.message || responseData?.error || `HTTP ${response.status} error`;
        throw new Error(`Flowise API error: ${errorMsg}`);
      }

      // Flowise API response format - check for text field
      if (responseData && typeof responseData === 'object' && responseData.text) {
        return responseData.text.trim();
      }

      // Alternative: response.data is directly the text
      if (responseData && typeof responseData === 'string') {
        // Make sure it's not HTML
        if (responseData.includes('<html') || responseData.includes('<!DOCTYPE')) {
          throw new Error('Flowise returned HTML. Please check your API endpoint configuration.');
        }
        return responseData.trim();
      }

      // If response has answer field
      if (responseData && responseData.answer) {
        return responseData.answer.trim();
      }

      // Log the actual response for debugging
      console.error('Unexpected Flowise response format:', {
        status: response.status,
        headers: response.headers['content-type'],
        dataType: typeof responseData,
        dataPreview: typeof responseData === 'string' 
          ? responseData.substring(0, 200) 
          : JSON.stringify(responseData).substring(0, 200)
      });

      throw new Error(
        'Unexpected response format from Flowise API. ' +
        'Expected JSON with "text" or "answer" field, but got: ' +
        (typeof responseData === 'string' ? 'HTML/text' : typeof responseData)
      );
    } catch (error) {
      // If it's already our custom error, just throw it
      if (error.message && (error.message.includes('Flowise') || error.message.includes('HTML'))) {
        throw error;
      }

      console.error('Flowise API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: this.apiUrl,
        responseData: error.response?.data
      });
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Invalid API key or unauthorized access. Please check your FLOWISE_API_KEY.');
      }
      
      if (error.response?.status === 404) {
        throw new Error(
          'Chatflow not found (404). Please verify:\n' +
          `1. Your chatflow ID is correct: ${this.chatflowId || 'N/A'}\n` +
          `2. Your API URL is correct: ${this.apiUrl}\n` +
          '3. The chatflow is deployed and accessible'
        );
      }
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The chatflow is taking too long to respond.');
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot connect to Flowise API at ${this.apiUrl}. ` +
          'Please check if the URL is correct and the service is accessible.'
        );
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to get AI response from Flowise'
      );
    }
  }
}

export default FlowiseService;


