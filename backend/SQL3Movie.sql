
CREATE TABLE movie (
	movieid	 BIGSERIAL,
	description	 TEXT(1024),
	release_date	 DATE NOT NULL,
	duration	 FLOAT(8) NOT NULL,
	rating	 FLOAT(8) NOT NULL,
	total_ratings INTEGER NOT NULL,
	PRIMARY KEY(movieid),
);

CREATE TABLE plataformuser (
	username VARCHAR(128),
	password VARCHAR(128) NOT NULL,
	email	 VARCHAR(128) NOT NULL,
	PRIMARY KEY(username),
);

CREATE TABLE ratings (
	ratingid		 BIGINT,
	rating__number	 SMALLINT,
	ranting_date		 DATE NOT NULL,
	comment		 TEXT(512),
	movie_movieid		 BIGINT NOT NULL,
	plataformuser_username VARCHAR(128) NOT NULL,
	PRIMARY KEY(ratingid,rating__number),
	FOREIGN KEY (movie_movieid) REFERENCES Movie(MovieID),
	FOREIGN KEY (plataformuser_username) REFERENCES PlataformUser(Username)
);

CREATE TABLE director (
	directorid BIGINT,
	name	 VARCHAR(128) NOT NULL,
	biography	 TEXT(1024),
	PRIMARY KEY(directorid),
);

CREATE TABLE genre (
	genre_id	 BIGSERIAL,
	gerne_name VARCHAR(128) NOT NULL,
	PRIMARY KEY(genre_id),
);

CREATE TABLE genre_movie (
	genre_genre_id BIGINT,
	movie_movieid	 BIGINT,
	PRIMARY KEY(genre_genre_id,movie_movieid),
	FOREIGN KEY (genre_genre_id) REFERENCES Genre(Genre_ID),
	FOREIGN KEY (movie_movieid) REFERENCES Movie(MovieID)
);

CREATE TABLE movie_director (
	movie_movieid	 BIGINT,
	director_directorid BIGINT,
	PRIMARY KEY(movie_movieid,director_directorid),
	FOREIGN KEY (movie_movieid) REFERENCES Movie(MovieID),
	FOREIGN KEY (director_directorid) REFERENCES Director(DirectorID)
);

ALTER TABLE ratings ADD CONSTRAINT Ratings_Constrain CHECK (Rating_Number <=5 and Rating_Number>=0);

