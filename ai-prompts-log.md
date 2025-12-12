# AI Prompt Documentation Log

This document serves as a record of all prompts sent to the LLM (Large Language Model) for the development of this project. Each entry documents the input, context, and a summary of the output generated, providing transparency and traceability for AI-assisted work.

---

## Template for New Entries

Use this template for each new LLM interaction:

```
### AI-[ID]: [Feature/Task Name]

**Date**: [YYYY-MM-DD]

**Model**: [e.g., GPT-4, Claude 3, Perplexity AI]

**Task Description**: 
[Brief description of what was asked to the LLM]

**Input Prompt**:
> [The exact prompt text sent to the LLM in good English]

**Files/References Provided**:
- `[filename]` - [Brief description of what was sent]
- `[filename]` - [Brief description of what was sent]
- Reference to use cases: UC-01 through UC-09

**Output Summary**:
The LLM generated [brief description, e.g., a draft of db-implementation-guide.md that included SQL queries for each use case and implementation guidelines].

**Key Outputs Generated**:
- `[output-filename.md]` - [Description of what this file contains]

**Review & Modifications**:
- **Reviewed by**: [Developer name]
- **Date Reviewed**: [YYYY-MM-DD]
- **Status**: ✅ Approved / ⚠️ Needs revision / 🔄 In progress
- **Changes Made**: [Summary of any modifications or corrections applied by the reviewer]
- **Notes**: [Any additional notes or observations]

---
```

## Completed Interactions

### AI-001: Database Architecture Review & Implementation Guide

**Date**: 2025-11-08

**Model**: Perplexity AI

**Task Description**: 
Create a comprehensive technical guide for the development team on how to implement all planned features using the current PostgreSQL database architecture. The guide should include an overview of the database structure and detailed implementation instructions for each use case (UC-01 through UC-09), along with analysis of whether additional tables are needed for advanced recommendation features.

**Input Prompt**:
> "Create a database architecture review and implementation guide in Markdown format. The document should include:
> 1. A general description of the DB architecture
> 2. Go UC by UC (UC-01 through UC-09) explaining how each feature can be answered with our database structure
> 3. Include SQL query examples for each use case where applicable
> 4. Add a section on advanced system preferences and recommendations
> 5. Provide recommendations on whether a new table is needed for advanced preferences and how it can be implemented
> 
> The file should be written for team members to easily develop the features in the future by reading the guide. Structure it clearly with code examples and best practices."

**Files/References Provided**:
- PostgreSQL creation script with full table definitions, foreign keys, and constraints
- Use case descriptions (UC-01 through UC-09) with detailed steps and pre/post-conditions
- Database schema diagram showing relationships between tables

**Output Summary**:
The LLM generated a comprehensive `db-implementation-guide.md` file that included:
- Overview of 7 core tables and their relationships
- Detailed implementation instructions for all 9 use cases
- SQL query examples for searching by title, director, and genre
- Recommendation algorithm for personalized movie suggestions
- Analysis showing that explicit user preferences table is optional
- Guidance on when and how to add user preferences if needed in the future
- Performance considerations and next steps for the development team

**Key Outputs Generated**:
- `db-implementation-guide.md` - Comprehensive technical guide with SQL queries and implementation logic for all features

**Review & Modifications**:
- **Reviewed by**: Rafael Carneiro
- **Date Reviewed**: 2025-11-08
- **Status**: ✅ Approved
- **Changes Made**: 
  - Verified SQL syntax accuracy against PostgreSQL 12+ standards
  - Confirmed all use cases are properly addressed
  - Validated recommendation algorithm logic
  - Added notes about caching strategies and index optimization
- **Notes**: The guide effectively demonstrates that the current schema is sufficient for all features without requiring additional tables at this stage. The recommendation algorithm section provides clear guidance for implementation.

---

## Notes for Future Interactions

- Always provide the full database schema and use case descriptions when discussing database-related features
- Reference specific table names and column names from the actual schema to ensure accuracy
- Include constraints and data types when asking about implementation
- Request both basic and advanced implementation strategies when relevant
- Ask for SQL query examples whenever querying databases is involved
- Specify the target database system (PostgreSQL, MySQL, etc.) to ensure dialect-specific advice
- Include team member names for review and approval tracking

---


### AI-02: Profile Management - Profile Tab
**Date**: 2025-11-15
**Model**: Figma IA
**Task Description**:
Generate the initial code for a React component for the Profile Tab, focusing on displaying user data (name, email, password placeholder) and allowing basic editing of these fields. The component must be styled and responsive.
**Input Prompt**:> "Generate a complete, modern, and responsive React component for a user 'Profile Tab'. The component should display the user's name, email, and a placeholder for an avatar. Include a 'Edit Profile' button that toggles an edit mode, allowing the user to update their name and email, and a 'Save Changes' button. Ensure and follow the best practices for component state management."
**Files/References Provided**:- `user_data_structure.json` - Data structure of the user object.- Reference to use cases: UC-05 (Update Profile Information)
**Output Summary**:
The LLM generated a functional component structure with state management for viewing and editing profile information, including necessary boilerplate code and responsive styling.
**Key Outputs Generated**:- `ProfileTab.jsx` (or similar) - React/Vue component for profile management.
**Review & Modifications**:- **Reviewed by**: Francisco Figueiredo- **Date Reviewed**: 2025-11-15- **Status**: ✅ Approved- **Changes Made**: Adjusted the data binding logic to integrate with the real backend and added client-side form validation.- **Notes**: The base component was very useful, saving time on the initial structure and styling.

---
### AI-03: Advanced Search (Movie/Director & Sorting)
**Date**: 2025-11-20
**Model**: Gemini Pro
**Task Description**:
Develop frontend logic to locally filter a list of movies based on a search term (movie title or director name) and apply ascending/descending sorting by year and rating.
**Input Prompt**:> "Write a JavaScript function called `applyAdvancedSearch(movies, searchTerm, sortField, sortDirection)` that takes an array of `movie` objects, a `searchTerm` (string), a `sortField` ('year' or 'rating'), and a `sortDirection` ('asc' or 'desc'). The function must first filter the list: a movie is included if its title *or* the director's name contains the `searchTerm` (case-insensitive). After filtering, it must sort the resulting array based on the specified `sortField` and `sortDirection`. The `movie` object structure is provided."
**Files/References Provided**:- `movie_data_structure.json` - Example of the movie object structure (includes title, year, rating, and director).- Reference to use cases: UC-02 (Search Movies), UC-03 (Filter/Sort Movies)
**Output Summary**:
The LLM provided a clean, efficient JavaScript function that correctly handles both the filtering logic (search term across two fields) and the sorting logic (numeric and alphabetical sorting in both directions).
**Key Outputs Generated**:- `searchUtils.js` - Function `applyAdvancedSearch` and helper functions.
**Review & Modifications**:- **Reviewed by**: Hugo Almeida- **Date Reviewed**: 2025-11-20- **Status**: ✅ Approved- **Changes Made**: Converted the syntax to TypeScript, adding types for inputs and outputs. The sorting algorithm remained the same.- **Notes**: The AI successfully handled the dual responsibility (filtering AND sorting) efficiently.

---
### AI-04: Rating Storage and Update Logic
**Date**: 2025-11-30
**Model**: ChatGPT 5.1 Thinking
**Task Description**:
Generate the code snippet to manage movie rating state on the frontend, ensuring rating data is persisted and correctly updated across different components or tabs (e.g., forcing an update when the user switches tabs).
**Input Prompt**:> "Develop a Redux slice for managing user ratings of movies. It needs to include two main actions: `setRating(movieId, rating)` to store or update a specific rating, and `loadRatings()` to retrieve all stored ratings. Crucially, provide a small code snippet demonstrating how to **force a state refresh or data re-fetch** in a main component when the browser tab is focused, ensuring the displayed rating is always the latest saved one across different views/tabs of the application."
**Files/References Provided**:- `RatingState.js` - Basic structure of the rating state.- Reference to use cases: UC-07 (Rate Movie)
**Output Summary**:
The LLM produced the boilerplate code for the state management module/slice and provided the correct use of the `window.addEventListener('focus', ...)` API to handle the cross-tab rating synchronization/refresh.
**Key Outputs Generated**:- `ratingsSlice.js` (or similar) - Redux/Vuex slice for rating management.- `MainComponent.jsx` - Code snippet for the tab focus logic.
**Review & Modifications**:- **Reviewed by**: Rafeal Carneiro- **Date Reviewed**: 2025-12-02- **Status**: ✅ Approved- **Changes Made**: Simplified the use of Local Storage for a more immediate persistence solution for the prototype, but kept the update logic on tab focus.- **Notes**: The suggestion to use the `focus` event on `window` was the exact solution for the requirement of updating across different tabs.

---
### AI-05: Personalized Recommendations - Recommendations Tab
**Date**: 2025-11-26
**Model**: Perplexity AI
**Task Description**:
Generate the boilerplate and presentation structure for the Recommendations Tab. The focus is on an attractive layout displaying recommendations in a responsive carousel or grid format, and a mock function to simulate the call to the recommendation service.
**Input Prompt**:> "Create a aesthetically pleasing and highly responsive React component (or Vue component) for a 'Recommendations Tab'. The component should fetch and display a list of recommended movies using a mock API function called `fetchRecommendations(userId)`. Use a Tailwind CSS grid layout where each movie card shows the title, a poster image placeholder, and the reason for recommendation. The layout should adapt well from mobile to desktop views."
**Files/References Provided**:- `recommendation_card_design.png` - Visual reference of the desired design for the movie card.- Reference to use cases: UC-08 (View Recommendations)
**Output Summary**:
The LLM generated a complete component with responsive styling, a functional mock API call using `useState`/`useEffect` (or similar lifecycle hooks), and a good layout for displaying movie cards in a grid/carousel format.
**Key Outputs Generated**:- `RecommendationsTab.jsx` (or similar) - React/Vue component for recommendations.
**Review & Modifications**:- **Reviewed by**: Hugo Almeida- **Date Reviewed**: 2025-11-30- **Status**: ⚠️ Needs revision- **Changes Made**: The data mock was replaced by the real backend call. The style needed minor margin and padding adjustments to fit the application's general look and feel.- **Notes**: The responsive layout structure was excellent, but the fetch integration needed adjustment for the real API.

---
### AI-06: Dark Mode Implementation
**Date**: 2025-12-09
**Model**: Gemini Pro
**Task Description**:
Implement Dark Mode functionality across the entire application using CSS variables and persisting user preference via Local Storage.
**Input Prompt**:> "Generate the necessary code to implement a robust 'Dark Mode' toggle functionality across the entire web application. The solution must include: 1) A function to toggle the dark mode class on the root element (e.g., `document.documentElement`). 2) Logic to persist the user's preference in Local Storage. 3) Code to check the persisted preference on application load to apply the correct theme immediately. Provide a simple button component snippet that uses the toggle function."
**Files/References Provided**:- `tailwind.config.js` - Tailwind configuration file.- Reference to use cases: UC-09 (Change Theme)
**Output Summary**:
The LLM provided the core JavaScript logic for reading, writing, and applying the theme preference using Local Storage and standard DOM manipulation, which is essential for theme toggling in modern frameworks.
**Key Outputs Generated**:- `themeUtils.js` - Functions `toggleTheme` and `initializeTheme`.- `ThemeToggleButton.jsx` (or similar) - Component for the toggle button.
**Review & Modifications**:- **Reviewed by**: Francisco Figueiredo- **Date Reviewed**: 2025-12-09- **Status**: ✅ Approved- **Changes Made**: Integrated the initialization function into the application entry point (e.g., `App.js` or `main.js`). No algorithms were changed.- **Notes**: Concise and complete solution, covering persistence and immediate theme application.

---
## Backend Endpoints & Algorithms
### AI-07: Movie Details Endpoint Implementation
**Date**: 2025-11-16
**Model**: Gemini 3
**Task Description**:
Implement a REST API endpoint to retrieve detailed information about a specific movie, including its reviews, average rating, and the current user's rating if they have reviewed the movie. The endpoint should use Django REST Framework and handle authentication properly.
**Input Prompt**:> "Create a Django REST Framework API endpoint for retrieving movie details by ID. The endpoint should:> 1. Accept a movie_id as a URL parameter
> 2. Require user authentication using JWT tokens
> 3. Return movie information including title, description, release date, rating, and total ratings
> 4. Include all genres and directors associated with the movie
> 5. Include all reviews for the movie with user information
> 6. Return the current authenticated user's rating and review description if they have reviewed this movie
> 7. Use proper serializers for nested relationships
> 8. Handle Movie.DoesNotExist exception with a 404 response
> 9. Return success/error responses in a consistent JSON format
>
> Use `prefetch_related` to optimize database queries for related objects."
**Files/References Provided**:- `models.py` - Movie, Review, Genre, Director, GenreMovie, DirectorMovie models- `serializers.py` - MovieDetailSerializer with nested relationships- Reference to UC-04: View movie details
**Output Summary**:
The LLM generated a complete `get_movie_details` view function that included proper authentication decorators, optimized database queries using `prefetch_related`, error handling for non-existent movies, and logic to retrieve the current user's rating and review. The response format was structured with success/error flags and properly serialized data.
**Key Outputs Generated**:- `views.py` - `get_movie_details` function with authentication, serialization, and user rating logic- Response JSON structure example showing nested genres, directors, and reviews
**Review & Modifications**:- **Reviewed by**: Rafael Carneiro- **Date Reviewed**: 2025-11-18- **Status**: ✅ Approved- **Changes Made**: No significant changes required.- **Notes**: The endpoint properly handles both authenticated access and returns personalized data.

---
### AI-08: Movie Rating and Review Endpoint
**Date**: 2025-11-20
**Model**: Gemini 3
**Task Description**:
Create a REST API endpoint that allows authenticated users to rate a movie and optionally add a text review. The endpoint should support both creating new reviews and updating existing ones using the `update_or_create` pattern, and automatically recalculate the movie's average rating.
**Input Prompt**:> "Implement a Django REST API view for rating movies with the following requirements:> 1. Accept POST requests with `movie_id`, `rating` (1-10), and optional `description`
> 2. Require authentication using `IsAuthenticated` permission
> 3. Validate that rating is a float between 1.0 and 10.0
> 4. Return 400 error if `movie_id` or `rating` is missing> 5. Return 404 error if movie doesn't exist> 6. Use `update_or_create` to either create a new review or update an existing one for this user and movie> 7. Set `created_at` to current timestamp on every update
> 8. After saving the review, recalculate the movie's average rating from all reviews
> 9. Update the movie's `rating` and `total_ratings` fields> 10. Return the `review_id`, whether it was created or updated, and the new movie statistics
> 11. Handle all exceptions with appropriate HTTP status codes
>
> Use `timezone.now()` for timestamps and ensure proper error messages for each validation failure."
**Files/References Provided**:
- `models.py` - Review model with user, movie, rating, description, created_at fields- `models.py` - Movie model with rating and total_ratings fields
- Authentication setup using JWT tokens
- Reference to UC-05: Rate a movie
**Output Summary**:
The LLM generated a complete `rate_movie` view that included comprehensive input validation, proper use of `update_or_create` for idempotent operations, automatic average rating calculation, and detailed success/error responses. The implementation properly handles edge cases like invalid ratings and missing movies.
**Key Outputs Generated**:- `views.py` - `rate_movie` function with validation, `update_or_create` logic, and rating recalculation- Error handling for missing fields, invalid rating range, and non-existent movies- Response structure showing `review_id`, creation status, and updated movie statistics
**Review & Modifications**:- **Reviewed by**: Fernando Santos- **Date Reviewed**: 2025-11-22- **Status**: ✅ Approved- **Changes Made**: Used `try-except` for rating type conversion to handle both `ValueError` and `TypeError`.- **Notes**: The `update_or_create` pattern ensures that users can only have one review per movie while allowing them to update it. The average rating is recalculated synchronously to ensure data consistency.

---
### AI-09: User Reviews Retrieval Endpoint
**Date**: 2025-11-24
**Model**: Gemini 3
**Task Description**:
Implement a REST API endpoint to retrieve all reviews created by a specific user, including the associated movie information. The endpoint should support filtering by username and return paginated results with proper serialization.
**Input Prompt**:> "Create a Django REST Framework endpoint to retrieve all reviews by a specific user with these specifications:> 1. Accept a `username` as a URL parameter> 2. Require authentication using `IsAuthenticated` permission class> 3. Query the Review model filtering by the specified user> 4. Use ReviewSerializer to serialize the results (which includes movie details)> 5. Return a JSON response with success flag, username, total count of reviews, and the serialized reviews array> 6. Handle the case when the user doesn't exist with a 404 response> 7. Return an empty array if the user exists but has no reviews> 8. Use `select_related` or `prefetch_related` to optimize queries for related movie data>
> The response should be consistent with other endpoints using success/error format."
**Files/References Provided**:- `models.py` - Review model with foreign keys to User and Movie- `serializers.py` - ReviewSerializer with nested movie information- URL routing configuration for `/api/reviews/user/<username>/`- Reference to UC-06: View user's review history
**Output Summary**:
The LLM generated a clean `get_user_reviews` view that properly handles user lookup, filters reviews efficiently, and returns a well-structured response. The implementation includes proper error handling and query optimization.
**Key Outputs Generated**:- `views.py` - `get_user_reviews` function with user lookup and review filtering- Response JSON structure with username, count, and reviews array- Error response for non-existent users
**Review & Modifications**:- **Reviewed by**: Rafael Carneiro- **Date Reviewed**: 2025-11-26- **Status**: ✅ Approved- **Changes Made**: No significant changes required.- **Notes**: This endpoint provides a foundation for user profile pages showing review history.

---
### AI-10: Content-Based Recommendation Algorithm
**Date**: 2025-11-28
**Model**: Gemini 3
**Task Description**:
Implement a personalized recommendation algorithm that suggests movies based on the user's favorite genres. The algorithm should analyze the user's highly-rated movies, identify their top 3 preferred genres, and recommend unwatched movies from those genres with a fallback to popular recommendations.
**Input Prompt**:> "Develop a Django view function for content-based movie recommendations with the following logic:> 1. Accept a required 'username' query parameter and optional 'limit' parameter (default 20)> 2. Return 400 error if username is not provided> 3. Return 404 if user doesn't exist> 4. Query all reviews by this user with rating >= 4.0 to identify liked movies> 5. If user has no liked movies, fall back to `popular_recommendations`
> 6. Extract the genre IDs from liked movies using the `GenreMovie` many-to-many relationship
> 7. Count occurrences of each genre and select the top 3 most frequent genres
> 8. Query movies that belong to these top 3 genres using `genremovie__genre_id`
> 9. Exclude movies the user has already rated (from liked_movies list)
> 10. Filter for movies with rating >= 4.0
> 11. Use `distinct()` to avoid duplicate movies from multiple genre matches
> 12. Order by rating descending and limit results
> 13. If no recommendations found, fall back to `popular_recommendations`
> 14. Return JSON with recommendations array containing id, title, rating, total_ratings, release_date, description
>
> The genre extraction should use `values()` with `annotate(count=Count('id'))` for aggregation."
**Files/References Provided**:
- `models.py` - Movie, Review, Genre, GenreMovie models with relationships
- `views.py` - `popular_recommendations` function for fallback
- Database schema showing many-to-many Genre-Movie relationship
- Reference to UC-07: Personalized recommendations

**Output Summary**:
The LLM generated a complete `for_you_recommendations` function implementing content-based filtering through genre analysis. The implementation includes three levels of fallback (no liked movies, no genres found, no recommendations match criteria), proper handling of many-to-many relationships, and optimized queries using `values()` and `annotate()`.

**Key Outputs Generated**:
- `views.py` - `for_you_recommendations` function with genre-based filtering logic
- Query logic for extracting and counting favorite genres
- Three-level fallback system ensuring recommendations are always returned
- JSON response structure with movie recommendations

**Review & Modifications**:
- **Reviewed by**: Fernando Santos
- **Date Reviewed**: 2025-11-30
- **Status**: ✅ Approved
- **Changes Made**: Added filtering to remove `None` values from genre_ids list comprehension.
- **Notes**: This algorithm provides good personalization for users with sufficient rating history. The fallback to popular recommendations ensures new users still get relevant suggestions.

---

### AI-11: Collaborative Filtering Recommendation Algorithm
**Date**: 2025-12-02
**Model**: Gemini 3
**Task Description**:
Implement a collaborative filtering recommendation system that finds users with similar tastes and recommends movies they enjoyed. The algorithm should identify similar users based on common highly-rated movies, then suggest movies those users liked that the current user hasn't seen yet.
**Input Prompt**:
> "Create a Django view for collaborative filtering recommendations with this detailed specification:
> 1. Accept required 'username' parameter and optional 'days' (default 60) and 'limit' (default 20)
> 2. Return error responses for missing username or non-existent user
> 3. Query user's reviews with rating >= 4.0 to get `user_liked_movie_ids`
> 4. Also get all movie IDs the user has reviewed (any rating) as `all_user_movie_ids`
> 5. If user has fewer than 3 liked movies, fall back to `popular_recommendations`
> 6. Find similar users who:
>    - Have rated movies from `user_liked_movie_ids` with rating >= 4.0
>    - Are not the current user (exclude by username)
>    - Have at least 3 movies in common (use annotate with `Count('review', distinct=True)`)
> 7. Order similar users by common_liked_movies descending and take top 10
> 8. Calculate date threshold for recent reviews (now - days)
> 9. Find movies that:
>    - Were rated >= 4.0 by similar users
>    - Were created/rated after the date threshold
>    - Are NOT in `all_user_movie_ids` (exclude all rated movies, not just liked ones)
> 10. Annotate with `likers_count` using `Count('review', distinct=True)`
> 11. Order by `likers_count` descending, then rating descending
> 12. Limit to specified number of recommendations
> 13. Return JSON response with movie details array
>
> Use `distinct=True` in all `Count` aggregations to handle many-to-many relationships properly."

**Files/References Provided**:
- `models.py` - PlataformaUser, Movie, Review models with relationships
- `views.py` - `popular_recommendations` function for fallback
- Database schema showing User-Review-Movie relationships
- Reference to UC-08: Collaborative filtering recommendations
- Requirements for minimum 3 common movies threshold
**Output Summary**:
The LLM generated a sophisticated `collaborative_recommendations` function implementing user-based collaborative filtering. The implementation includes proper handling of cold start problems (users with liked movies), time-based filtering to prioritize recent recommendations, distinction between liked movies and all rated movies for filtering, and aggregation logic to find and rank similar users.

**Key Outputs Generated**:
- `views.py` - `collaborative_recommendations` function with user similarity calculation
- Query logic for finding users with common preferences (minimum 3 overlapping movies)
- Time-based filtering using date threshold
- Ranking by popularity among similar users (`likers_count`)
- Proper exclusion of all previously rated movies, not just liked ones

**Review & Modifications**:
- **Reviewed by**: Fernando Santos
- **Date Reviewed**: 2025-12-05
- **Status**: ✅ Approved
- **Changes Made**:
  - Corrected to exclude `all_user_movie_ids` instead of just `user_liked_movie_ids` to avoid recommending movies the user already rated poorly
  - Added `distinct=True` to `Count` aggregations to handle duplicate reviews in many-to-many scenarios
  - Verified that the 3-movie threshold provides good balance between finding similar users and maintaining recommendation quality
  - Confirmed date-based filtering improves relevance by prioritizing recent user behavior
- **Notes**: This collaborative filtering approach complements the content-based recommendations well. The combination of user similarity threshold (3+ common movies) and time-based filtering ensures recommendations stay relevant. The distinction between `user_liked_movie_ids` (for finding similar users) and `all_user_movie_ids` (for exclusion) is crucial for avoiding re-recommending poorly-rated movies.

---

## 📝 Notes for Future Interactions

- Always provide the full database schema and model definitions when discussing feature implementation
- Reference specific model names, fields, and relationships from the actual Django models
- Include use case descriptions (UC-XX) to provide context
- Request both implementation code and error handling strategies
- Ask for optimization techniques (`prefetch_related`, `select_related`, `annotate`) when querying databases
- Specify response format requirements (JSON structure, success/error flags)
- Include authentication and permission requirements in the prompt
- Request fallback strategies for edge cases (empty results, new users, missing data)
- Ask for comments explaining complex query logic

---

## 🛠️ Document Maintenance

- **Last Updated**: 2025-12-12
- **Created By**: Development Team
- **Version**: 1.0
- **Approved By**: Rafael Carneiro & Fernando Santos & Francisco Figueiredo & Hugo Almeida
