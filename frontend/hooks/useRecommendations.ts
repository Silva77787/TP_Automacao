import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/constants/api";
import { Movie } from "@/hooks/useMovies";
import { useCallback, useEffect, useState } from "react";

type RecommendationType = "popular" | "forYou" | "collaborative";

interface RecommendationRaw {
  id: number;
  title: string;
  rating: number;
  total_ratings: number;
  release_date: string;
  description: string;
}

interface RecommendationResponse {
  success: boolean;
  message: string;
  count: number;
  recommendations: RecommendationRaw[];
}

interface UseRecommendationsOptions {
  limit?: number;
  days?: number;
  enabled?: boolean; 
}

export function useRecommendations(
  type: RecommendationType,
  options: UseRecommendationsOptions = {}
) {
  const { accessToken, user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (options.enabled === false) {
      return;
    }

    if (!accessToken) {
      setMovies([]);
      setError("Utilizador não autenticado.");
      return;
    }

    let endpoint = "";
    const params = new URLSearchParams();

    try {
      switch (type) {
        case "popular":
          endpoint = API_ENDPOINTS.REC_POPULAR;
          if (options.days != null) {
            params.append("days", String(options.days));
          }
          if (options.limit != null) {
            params.append("limit", String(options.limit));
          }
          break;

        case "forYou":
          endpoint = API_ENDPOINTS.REC_FOR_YOU;
          if (!user?.username) {
            setError("Username em falta para recomendações personalizadas.");
            setMovies([]);
            return;
          }
          params.append("username", user.username);
          if (options.limit != null) {
            params.append("limit", String(options.limit));
          }
          break;

        case "collaborative":
          endpoint = API_ENDPOINTS.REC_COLLAB;
          if (!user?.username) {
            setError("Username em falta para recomendações colaborativas.");
            setMovies([]);
            return;
          }
          params.append("username", user.username);
          if (options.days != null) {
            params.append("days", String(options.days));
          }
          if (options.limit != null) {
            params.append("limit", String(options.limit));
          }
          break;
      }

      const url =
        params.toString().length > 0 ? `${endpoint}?${params.toString()}` : endpoint;

      setLoading(true);
      setError(null);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data: RecommendationResponse = await res.json();
      console.log("🎯 Recommendations response:", res.status, data);

      if (!data.success) {
        setError(data.message || "Falha ao carregar recomendações.");
        setMovies([]);
        return;
      }

      setMessage(data.message || null);

      const normalized: Movie[] = (data.recommendations || []).map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description ?? "",
        release_date: m.release_date ?? "1900-01-01",
        rating: m.rating ?? 0,
        total_ratings: m.total_ratings ?? 0,
        // estes vêm vazios aqui, mas o MovieDetails depois vai buscar info completa
        genres: [],
        directors: [],
      }));

      setMovies(normalized);
    } catch (err: any) {
      console.error("❌ Error fetching recommendations:", err);
      setError(err.message || "Erro ao carregar recomendações.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [
    type,
    accessToken,
    user?.username,
    options.limit,
    options.days,
    options.enabled,
  ]);

  useEffect(() => {
    // Dispara quando o tipo/parametros mudam
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    movies,
    loading,
    error,
    message,
    refetch: fetchRecommendations,
  };
}

