import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('quizAppToken');
    if (token) {
      // Get user data using the token
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user data using token
  const fetchUserData = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`${API_URL}/me`, config);
      
      if (response.data.success) {
        setCurrentUser({
          ...response.data.user,
          token
        });
      } else {
        // If there's an issue with the token, clear it
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (userData) => {
    setError(null);
    try {
      // First, check if the email exists and get the user's role
      try {
        const checkResponse = await axios.post(`${API_URL}/check-email`, {
          email: userData.email
        });
        
        // If email exists but roles don't match, return error
        if (checkResponse.data.exists && checkResponse.data.role !== userData.role) {
          setError(`This email is registered as a ${checkResponse.data.role}, not a ${userData.role}`);
          return { 
            success: false, 
            error: `This email is registered as a ${checkResponse.data.role}, not a ${userData.role}`
          };
        }
      } catch (error) {
        // If endpoint doesn't exist or another error occurs, continue with login attempt
        console.log("Email check failed, continuing with login attempt");
      }

      const response = await axios.post(`${API_URL}/login`, {
        email: userData.email,
        password: userData.password,
        role: userData.role // Send role to server for validation
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Verify role matches
        if (user.role !== userData.role) {
          setError(`This account is registered as a ${user.role}, not a ${userData.role}`);
          return { 
            success: false, 
            error: `This account is registered as a ${user.role}, not a ${userData.role}` 
          };
        }
        
        // Store token in localStorage
        localStorage.setItem('quizAppToken', token);
        
        // Set user data in state (use the server's role)
        setCurrentUser({
          ...user,
          token
        });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred during login. Please try again.'
      );
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Signup function
  const signup = async (userData) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('quizAppToken', token);
        
        // Set user data in state
        setCurrentUser({
          ...user,
          token
        });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred during signup. Please try again.'
      );
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('quizAppToken');
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 