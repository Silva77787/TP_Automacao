import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

interface ApiErrorResponse {
  status: number;
  message: string;
  data: any;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Public POST (login, register)
  async post<T>(endpoint: string, body: any): Promise<T> {
    const headers = await this.getHeaders(false);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.error || data.message || "Request failed",
          data,
        } as ApiErrorResponse;
      }

      return data;
    } catch (error) {
      console.error("POST error:", error);
      throw error;
    }
  }

  // Authenticated POST
  async authenticatedPost<T>(endpoint: string, body: any): Promise<T> {
    const headers = await this.getHeaders(true);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.error || data.message || "Request failed",
          data,
        } as ApiErrorResponse;
      }

      return data;
    } catch (error) {
      console.error("Authenticated POST error:", error);
      throw error;
    }
  }

  // Authenticated GET
  async authenticatedGet<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders(true);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.error || data.message || "Request failed",
          data,
        } as ApiErrorResponse;
      }

      return data;
    } catch (error) {
      console.error("Authenticated GET error:", error);
      throw error;
    }
  }

  // Refresh token
  async refreshAccessToken(refreshToken: string): Promise<{ access: string }> {
    const headers = await this.getHeaders(false);

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      return { access: data.access };
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService(API_BASE_URL);