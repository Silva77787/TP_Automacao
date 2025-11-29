import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/constants/api";

// Add user_rating to the Movie definition
export interface Movie {
  id: number;
  title: string;
  description: string;
  release_date: string;
  rating: number;
  total_ratings: number;
  genres: Array<{ id: number; gerne_name: string }>;
  directors: Array<{ id: number; name: string; biography: string }>;
  user_rating?: number | null; // 👈 This allows us to store the user's specific rating
}

interface CatalogResponse {
  success: boolean;
  message: string;
  count: number;
  movies: Movie[];
}

// The backend sends user_rating OUTSIDE the movie object
interface MovieDetailsResponse {
  success: boolean;
  movie: Movie & {
    reviews: Array<{ id: number; user: string; rating: number; description: string; created_at: string }>;
  };
  user_rating?: number | null; 
}

export function useMovies() {
  const { accessToken } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    if (!accessToken) return; // Silent return if no token yet

    setLoading(true);
    setError(null);

    try {
      console.log("🎬 Fetching movie catalog...");
      
      const response = await fetch(API_ENDPOINTS.CATALOG, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data: CatalogResponse = await response.json();

      if (data.success && data.movies) {
        setMovies(data.movies);
      } else {
        setError(data.message || "Failed to load catalog");
      }
    } catch (err: any) {
      console.error("❌ Error fetching movies:", err);
      setError(err.message || "Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchCatalog();
    }
  }, [accessToken]);

  return { movies, loading, error, refetch: fetchCatalog };
}

// Hook for fetching single movie details
export function useMovieDetails(movieId: number | null) {
  const { accessToken } = useAuth();
  const [movie, setMovie] = useState<(Movie & { reviews: any[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!movieId || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = API_ENDPOINTS.MOVIE_DETAILS(movieId);
      console.log("🎬 Fetching details from:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data: MovieDetailsResponse = await response.json();

      if (data.success && data.movie) {
        console.log("✅ Data received. User Rating:", data.user_rating);


        const movieWithRating = {
            ...data.movie,
            user_rating: data.user_rating // 
        };

        setMovie(movieWithRating);
      } else {
        setError("Failed to load movie details");
      }
    } catch (err: any) {
      console.error("❌ Error fetching movie details:", err);
      setError(err.message || "Failed to fetch movie details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchDetails();
    }
  }, [movieId, accessToken]);

  return { movie, loading, error, refetch: fetchDetails };
}

// Hook for rating movies
export function useRateMovie() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rateMovie = async (movieId: number, rating: number, description: string = "") => {
    if (!accessToken) {
      setError("Not authenticated");
      return null;
    }

    if (rating < 1 || rating > 10) {
      setError("Rating must be between 1 and 10");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`⭐ Rating movie ${movieId} with ${rating}`);

      const response = await fetch(API_ENDPOINTS.RATE_MOVIE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          movie_id: movieId,
          rating,
          description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          movieAverageRating: data.movie_average_rating,
          movieTotalRatings: data.movie_total_ratings,
        };
      } else {
        setError(data.error || "Failed to rate movie");
        return null;
      }
    } catch (err: any) {
      console.error("❌ Error rating movie:", err);
      setError(err.message || "Failed to rate movie");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { rateMovie, loading, error };
}