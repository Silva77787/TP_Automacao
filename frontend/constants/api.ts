// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login/`,
  REGISTER: `${API_BASE_URL}/api/register/`,
  MOVIES: `${API_BASE_URL}/api/movies/`,
  USER: (username: string) => `${API_BASE_URL}/api/user/${username}/`,
  UPDATE_USER: (username: string) => `${API_BASE_URL}/api/user/${username}/update/`,
};

