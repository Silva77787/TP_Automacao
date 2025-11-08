# Database Architecture Review & Implementation Guide

## Overview

This document provides a guide for the development team on how to implement all planned features using the current PostgreSQL database architecture. The database follows a normalized relational design with foreign key relationships and integrity constraints to support a movie recommendation system.

### Database Architecture Summary

The system consists of **7 core tables** organized as follows:

- **plataformuser**: Stores user authentication and profile information (username, password, email)
- **movie**: Contains all movie metadata (title, description, release date, duration, rating, total ratings)
- **ratings**: Junction table linking users with movies, storing user ratings (1-5 scale) and comments
- **director**: Stores director information (name, biography)
- **genre**: Stores genre categories (genre name)
- **movie_director**: Junction table linking movies to their directors (many-to-many relationship)
- **genre_movie**: Junction table linking movies to their genres (many-to-many relationship)

All relationships are properly normalized using composite primary keys and foreign key constraints. Data integrity is enforced through CHECK constraints (e.g., ratings must be between 0 and 5).

---

## Use Case Implementation Guide

### UC-01: Registar Utilizador (User Registration)

**Purpose**: Allow new users to create an account in the system.

**Database Tables Used**: `plataformuser`

**Implementation Details**:

1. When a user submits registration data (username, password, email), validate the input on the application layer.
2. Query the `plataformuser` table to check if the username or email already exists:
   ```sql
   SELECT COUNT(*) FROM plataformuser WHERE username = ? OR email = ?;
   ```
3. If no duplicate is found, insert the new user record:
   ```sql
   INSERT INTO plataformuser (username, password, email) VALUES (?, ?, ?);
   ```
4. Handle exceptions: If the query returns a duplicate, notify the user. If a server error occurs during INSERT, display an appropriate error message.

**Key Constraints**:
- Username must be unique (PRIMARY KEY)
- Password and email are NOT NULL
- Use proper password hashing before storing (bcrypt recommended)

---

### UC-02: Login do Utilizador (User Login)

**Purpose**: Authenticate users and create active sessions.

**Database Tables Used**: `plataformuser`

**Implementation Details**:

1. When a user submits login credentials (username/email and password), query the user record:
   ```sql
   SELECT password FROM plataformuser WHERE username = ? OR email = ?;
   ```
2. Compare the submitted password with the stored hashed password using bcrypt or similar.
3. If the password matches, create an active session token on the application layer (e.g., JWT).
4. If credentials are invalid, return an error message without revealing whether the username or password was incorrect (security best practice).

**Key Constraints**:
- Passwords must be hashed before storage
- Session management should be handled at the application layer (not in the database for scalability)
- No new database records are created; authentication is read-only from `plataformuser`

---

### UC-03: Exibir Catálogo de Filmes (Display Movie Catalog)

**Purpose**: Display a list of all movies with their basic details (title, genre, description, rating).

**Database Tables Used**: `movie`, `genre`, `genre_movie`

**Implementation Details**:

1. Query all movies with their genres and average ratings:
   ```sql
   SELECT 
     m.movieid, 
     m.description, 
     m.release_date, 
     m.duration, 
     m.rating, 
     m.total_ratings,
     STRING_AGG(g.gerne_name, ', ') AS genres
   FROM movie m
   LEFT JOIN genre_movie gm ON m.movieid = gm.movie_movieid
   LEFT JOIN genre g ON gm.genre_genre_id = g.genre_id
   GROUP BY m.movieid
   ORDER BY m.rating DESC;
   ```
2. Display the results on the user interface with movie cards showing title, genres, description, and average rating.
3. Handle the empty catalog case by displaying an appropriate message if no movies are found.

**Key Constraints**:
- Use LEFT JOIN to ensure movies without genres are still displayed
- Pagination should be implemented on the application layer for performance
- Aggregate genres using STRING_AGG or similar string concatenation function

---

### UC-04: Pesquisa de Filme (Search Movies)

**Purpose**: Allow users to search for movies by title, director, or genre.

**Database Tables Used**: `movie`, `director`, `genre`, `movie_director`, `genre_movie`

**Implementation Details**:

1. **Search by Title**:
   ```sql
   SELECT DISTINCT m.* FROM movie m
   WHERE LOWER(m.description) ILIKE ? OR m.movieid IN (
     SELECT m2.movieid FROM movie m2 
     WHERE LOWER(CAST(m2.movieid AS TEXT)) ILIKE ?
   );
   ```

2. **Search by Director**:
   ```sql
   SELECT DISTINCT m.* FROM movie m
   JOIN movie_director md ON m.movieid = md.movie_movieid
   JOIN director d ON md.director_directorid = d.directorid
   WHERE LOWER(d.name) ILIKE ?;
   ```

3. **Search by Genre**:
   ```sql
   SELECT DISTINCT m.* FROM movie m
   JOIN genre_movie gm ON m.movieid = gm.movie_movieid
   JOIN genre g ON gm.genre_genre_id = g.genre_id
   WHERE LOWER(g.gerne_name) ILIKE ?;
   ```

4. Combine searches using UNION or implement separate endpoints for each search type.
5. Return all matching results and display them to the user.

**Key Constraints**:
- Use ILIKE for case-insensitive matching
- Use DISTINCT to avoid duplicate results when joining multiple tables
- Implement input validation to prevent SQL injection
- Consider full-text search indexes for production environments

---

### UC-05: Avaliar Filme (Rate Movie)

**Purpose**: Allow users to rate movies on a 1-5 scale and add comments.

**Database Tables Used**: `ratings`

**Implementation Details**:

1. When a user submits a rating (1-5 stars) and optional comment for a movie:
   ```sql
   INSERT INTO ratings (ratingid, rating__number, ranting_date, comment, movie_movieid, plataformuser_username)
   VALUES (DEFAULT, ?, CURRENT_DATE, ?, ?, ?)
   ON CONFLICT (ratingid, rating__number) DO UPDATE SET
     rating__number = EXCLUDED.rating__number,
     comment = EXCLUDED.comment,
     ranting_date = CURRENT_DATE;
   ```

2. Update the movie's aggregate rating and total ratings:
   ```sql
   UPDATE movie SET 
     rating = (SELECT AVG(CAST(rating__number AS FLOAT)) FROM ratings WHERE movie_movieid = ?),
     total_ratings = (SELECT COUNT(*) FROM ratings WHERE movie_movieid = ?)
   WHERE movieid = ?;
   ```

3. Confirm the operation to the user.

**Key Constraints**:
- The CHECK constraint enforces rating values between 0 and 5
- A user can only have one rating per movie (implement uniqueness at application layer with UNIQUE constraint)
- Use CURRENT_DATE to automatically record the rating date
- Update aggregate ratings after each new rating is inserted

---

### UC-06: Visualizar Detalhes de Filme (View Movie Details)

**Purpose**: Display complete movie information including title, description, genres, director(s), duration, and average rating.

**Database Tables Used**: `movie`, `director`, `genre`, `movie_director`, `genre_movie`, `ratings`

**Implementation Details**:

1. Query complete movie details by movieid:
   ```sql
   SELECT 
     m.movieid,
     m.description,
     m.release_date,
     m.duration,
     m.rating,
     m.total_ratings,
     STRING_AGG(DISTINCT d.name, ', ') AS directors,
     STRING_AGG(DISTINCT g.gerne_name, ', ') AS genres
   FROM movie m
   LEFT JOIN movie_director md ON m.movieid = md.movie_movieid
   LEFT JOIN director d ON md.director_directorid = d.directorid
   LEFT JOIN genre_movie gm ON m.movieid = gm.movie_movieid
   LEFT JOIN genre g ON gm.genre_genre_id = g.genre_id
   WHERE m.movieid = ?
   GROUP BY m.movieid;
   ```

2. Query user ratings and comments for this movie:
   ```sql
   SELECT plataformuser_username, rating__number, comment, ranting_date
   FROM ratings
   WHERE movie_movieid = ?
   ORDER BY ranting_date DESC;
   ```

3. Display all details on a detailed movie page, including the current user's rating if they've already rated it.

**Key Constraints**:
- Handle cases where a movie has no director or genre gracefully
- Use LEFT JOIN to ensure all movie information is displayed
- Aggregate strings using STRING_AGG with DISTINCT to avoid duplicates
- Cache movie details when possible for performance

---

### UC-07: Obter Recomendações Personalizadas (Get Personalized Recommendations)

**Purpose**: Suggest movies to users based on their rating history and genre preferences.

**Database Tables Used**: `ratings`, `movie`, `genre`, `genre_movie`, `director`, `movie_director`

**Implementation Details**:

**Basic Recommendation Strategy** (Content-Based Filtering):

1. Identify the genres the user has rated highly (rating >= 4):
   ```sql
   SELECT g.genre_id, g.gerne_name, COUNT(*) as genre_count
   FROM ratings r
   JOIN movie m ON r.movie_movieid = m.movieid
   JOIN genre_movie gm ON m.movieid = gm.movie_movieid
   JOIN genre g ON gm.genre_genre_id = g.genre_id
   WHERE r.plataformuser_username = ? AND r.rating__number >= 4
   GROUP BY g.genre_id, g.gerne_name
   ORDER BY genre_count DESC;
   ```

2. Find movies in these preferred genres that the user hasn't rated yet:
   ```sql
   SELECT DISTINCT m.movieid, m.description, m.rating, m.total_ratings
   FROM movie m
   JOIN genre_movie gm ON m.movieid = gm.movie_movieid
   WHERE gm.genre_genre_id IN (?, ?, ...)
   AND m.movieid NOT IN (
     SELECT DISTINCT movie_movieid FROM ratings 
     WHERE plataformuser_username = ?
   )
   ORDER BY m.rating DESC, m.total_ratings DESC
   LIMIT 10;
   ```

3. If the user has no ratings, show popular movies (sorted by rating and total_ratings):
   ```sql
   SELECT m.* FROM movie m
   ORDER BY m.rating DESC, m.total_ratings DESC
   LIMIT 10;
   ```

**Advanced Recommendation Strategy** (Optional - Collaborative Filtering):
- Find users with similar rating patterns to the current user
- Recommend movies rated highly by similar users but not yet rated by the current user
- This requires additional processing logic at the application layer

**Key Constraints**:
- Always exclude movies the user has already rated
- Prioritize highly-rated movies with many ratings to ensure quality
- Fall back to popular movies if personalized recommendations cannot be generated
- Cache recommendations periodically to reduce database load

---

### UC-08: Logout do Utilizador (User Logout)

**Purpose**: Securely end a user session.

**Database Tables Used**: None (Session management is handled at application layer)

**Implementation Details**:

1. This use case is handled entirely at the application layer.
2. When the user clicks logout:
   - Invalidate the user's session token (remove from in-memory session store or cache)
   - Clear any client-side authentication tokens (cookies, localStorage)
   - Redirect the user to the login page

**Key Constraints**:
- No database queries are required; session management should be stateless (using JWT) or stored in a session store (Redis), not in PostgreSQL
- Ensure the token invalidation is immediate to prevent unauthorized access

---

### UC-09: Gestão de Dados do Utilizador (User Profile Management)

**Purpose**: Allow users to view and update their personal information.

**Database Tables Used**: `plataformuser`

**Implementation Details**:

1. Query the user's current profile:
   ```sql
   SELECT username, email FROM plataformuser WHERE username = ?;
   ```

2. Display the user's information on the profile page.

3. When the user requests to update their profile:
   ```sql
   UPDATE plataformuser 
   SET email = ?
   WHERE username = ?;
   ```

4. Validate the new email format before updating.

5. If password update is required, hash the new password before storing:
   ```sql
   UPDATE plataformuser 
   SET password = ?
   WHERE username = ?;
   ```

6. Confirm the update to the user.

**Key Constraints**:
- Email should be validated to ensure it's in a valid format
- Passwords must always be hashed before storage
- Consider adding an email verification step for security
- Use transactions to ensure data consistency if updating multiple fields
- Log profile updates for audit purposes (optional, requires an audit table)

---

## Advanced Feature: Recommendations with User Preferences (Optional Enhancement)

### Should We Create a New Table for Advanced Preferences?

**Current Situation**: The recommendation system can function well using the existing schema by analyzing user ratings history and genre preferences derived from rated movies.

**When to Add a New Table**:

If We want to implement **explicit user genre preferences** (where users can manually set preferred genres without having rated any movies), you would need a new table:

```sql
CREATE TABLE user_genre_preference (
    preference_id BIGSERIAL,
    username VARCHAR(128) NOT NULL,
    genre_id BIGINT NOT NULL,
    preference_level FLOAT NOT NULL CHECK (preference_level >= 0 AND preference_level <= 5),
    last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY(preference_id),
    FOREIGN KEY(username) REFERENCES plataformuser(username) ON DELETE CASCADE,
    FOREIGN KEY(genre_id) REFERENCES genre(genre_id) ON DELETE CASCADE,
    UNIQUE(username, genre_id)
);
```

### Recommendation: Do NOT Create This Table Yet

**Reasons**:
1. **Sufficient Data Available**: Your `ratings` table provides implicit genre preferences by tracking which genres users have rated highly
2. **Simpler Maintenance**: One less table means fewer constraints to manage
3. **More Accurate**: User behavior (ratings) is more reliable than self-reported preferences
4. **Scalability**: The current approach doesn't require additional storage or queries

### How to Implement Advanced Recommendations WITHOUT a New Table

**Weighted Recommendation Algorithm**:

```sql
WITH user_genre_preferences AS (
  SELECT 
    g.genre_id,
    g.gerne_name,
    AVG(r.rating__number) as avg_rating,
    COUNT(r.ratingid) as rating_count
  FROM ratings r
  JOIN movie m ON r.movie_movieid = m.movieid
  JOIN genre_movie gm ON m.movieid = gm.movie_movieid
  JOIN genre g ON gm.genre_genre_id = g.genre_id
  WHERE r.plataformuser_username = ?
  GROUP BY g.genre_id, g.gerne_name
),
weighted_movies AS (
  SELECT 
    m.movieid,
    m.description,
    m.rating,
    m.total_ratings,
    SUM(ugp.avg_rating * ugp.rating_count) / SUM(ugp.rating_count) as preference_score
  FROM movie m
  JOIN genre_movie gm ON m.movieid = gm.movie_movieid
  JOIN user_genre_preferences ugp ON gm.genre_genre_id = ugp.genre_id
  WHERE m.movieid NOT IN (
    SELECT DISTINCT movie_movieid FROM ratings 
    WHERE plataformuser_username = ?
  )
  GROUP BY m.movieid
)
SELECT * FROM weighted_movies
ORDER BY preference_score DESC, rating DESC
LIMIT 10;
```

**Benefits of This Approach**:
- Weights recommendations based on how highly the user rated similar genres
- Combines user preference with movie quality (rating)
- No additional table required
- More sophisticated than simple genre matching

### If You Decide to Add User Preferences Later

You can enhance the recommendation algorithm by combining both sources:

```sql
-- Combine explicit preferences with inferred preferences from ratings
SELECT 
  COALESCE(ep.genre_id, ip.genre_id) as genre_id,
  COALESCE(ep.preference_level, ip.avg_rating) as effective_preference
FROM explicit_preferences ep
FULL OUTER JOIN inferred_preferences ip ON ep.genre_id = ip.genre_id
WHERE ep.username = ? OR ip.username = ?
ORDER BY effective_preference DESC;
```

---

## Summary

The current database architecture fully supports all 9 use cases and can implement a functional recommendation system using existing data. Adding an explicit user preferences table is optional and only necessary if we want users to manually declare preferences independent of their rating history.

**Next Steps for Your Team**:
1. Implement all use cases following the SQL queries and logic provided above
2. Add proper input validation and error handling at the application layer
3. Consider caching frequently accessed data (catalog, recommendations) for performance
4. Monitor query performance and add indexes on frequently filtered columns (username, genre_id, rating__number)
5. Implement transactions for operations that modify multiple records (e.g., rating updates)
6. Revisit the user preferences table requirement once you have a working MVP and user feedback