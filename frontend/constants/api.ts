// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://findyourmovie.cbc-streaming.pt';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login/`,
  REGISTER: `${API_BASE_URL}/auth/register/`,
  REFRESH: `${API_BASE_URL}/auth/refresh/`,

  // Movies
  CATALOG: `${API_BASE_URL}/movies/catalog/`,
  MOVIE_DETAILS: (id: number) => `${API_BASE_URL}/movie/${id}/details/`,
  RATE_MOVIE: `${API_BASE_URL}/movies/rate/`,

  // User
  GET_USER: (username: string) => `${API_BASE_URL}/user/${username}/`,
  UPDATE_USER: (username: string) =>
    `${API_BASE_URL}/user/${username}/update/`,
  GET_USER_REVIEWS: (username: string) =>
    `${API_BASE_URL}/user/${username}/reviews/`,
};

