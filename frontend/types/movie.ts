export interface Movie {
  id: number;
  title: string;
  description: string;
  release_date: string;
  rating: number;
  total_ratings: number;
  genres: Array<{ id: number; gerne_name: string }>;
  directors: Array<{ id: number; name: string; biography: string }>;
  image?: string; 
  year?: number; 
  runtime?: number; 
  user_rating?: number | null;
}

export interface MovieDisplay extends Movie {
  year: number; 
  genre: string; 
  director: string; 
  runtime: number; 
  cast: string[];
  image: string; 
}