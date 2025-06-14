// API base URL - adjust this based on your backend configuration
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic request handler with error management
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get the token from localStorage
  const token = localStorage.getItem('quizAppToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  try {
    // Add timeout to prevent infinite loading
    const timeoutDuration = 30000; // 30 seconds
    
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
    
    const fetchPromise = fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    // Wait for the fetch to complete
    const response = await fetchPromise;
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Request failed with status ${response.status}` };
      }
      
      console.log('API Error Response:', errorData);
      
      if (errorData.errors) {
        throw new Error(JSON.stringify({
          message: errorData.message || `Request failed with status ${response.status}`,
          errors: errorData.errors
        }));
      } else {
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
    }
    
    // Return the parsed JSON response
    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server took too long to respond.');
    } else if (error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (!navigator.onLine) {
      throw new Error('You are currently offline. Please check your internet connection.');
    }
    
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
    // Log the request payload for debugging
    console.log('AI Quiz Generation Request:', aiPromptData);
    
    // Make sure the data matches the expected format
    const payload = {
      topic: aiPromptData.topic,
      level: aiPromptData.level,
      difficulty: aiPromptData.difficulty,
      questionCount: parseInt(aiPromptData.numQuestions, 10)
    };
    
    return request('/quiz/ai', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  
  // Verify a question using AI
  verifyQuestion: async (verificationData) => {
    return request('/quiz/verify-question', {
      method: 'POST',
      body: JSON.stringify(verificationData)
    });
  },
  
  // Regenerate specific questions in a quiz
  regenerateQuestions: async (regenerationData) => {
    return request('/quiz/regenerate-questions', {
      method: 'POST',
      body: JSON.stringify(regenerationData)
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