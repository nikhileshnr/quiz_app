// API base URL - adjust this based on your backend configuration
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic request handler with error management
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    // Return the parsed JSON response
    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Quiz API methods
 */
export const quizApi = {
  // Create a quiz manually
  createManual: async (quizData) => {
    return request('/quiz/manual', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
  },
  
  // Generate a quiz using AI
  createWithAI: async (aiPromptData) => {
    return request('/quiz/ai', {
      method: 'POST',
      body: JSON.stringify(aiPromptData)
    });
  },
  
  // Get all quizzes (with pagination)
  getAll: async (page = 1, limit = 10) => {
    return request(`/quiz?page=${page}&limit=${limit}`, {
      method: 'GET'
    });
  },
  
  // Get a specific quiz by ID
  getById: async (quizId) => {
    return request(`/quiz/${quizId}`, {
      method: 'GET'
    });
  },
  
  // Update a quiz
  update: async (quizId, quizData) => {
    return request(`/quiz/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData)
    });
  },
  
  // Delete a quiz
  delete: async (quizId) => {
    return request(`/quiz/${quizId}`, {
      method: 'DELETE'
    });
  }
};

export default {
  quiz: quizApi
}; 