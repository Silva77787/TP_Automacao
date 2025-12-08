import React from "react";
import { useMovieDetails } from "@/hooks/useMovies";
import { MovieDetails } from "@/components/MovieDetails";

interface MovieDetailsWrapperProps {
  movieID: number | null;
  visible: boolean;
  onClose: () => void;
  onRated?: (
    movieId: number,
    newAverage: number,
    newTotal: number,
    userRating: number
  ) => void;
}

export function MovieDetailsWrapper({
  movieID,
  visible,
  onClose,
  onRated,
}: MovieDetailsWrapperProps) {
  const { movie } = useMovieDetails(visible ? movieID : null);

  if (!visible || !movie) return null;

  return (
    <MovieDetails
      movie={movie}
      visible={visible}
      onClose={onClose}
      onRated={onRated}
    />
  );
}
