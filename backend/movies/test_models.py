from django.test import TestCase
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError
from datetime import date

from movies.models import (
    PlataformaUser, Genre, Director, Movie, GenreMovie,
    MovieDirector, Review
)

############################################
# PlataformaUser Tests
############################################
class TestPlataformaUser(TestCase):

    def test_create_user(self):
        user = PlataformaUser.objects.create(
            username="john",
            password="secret",
            email="john@example.com"
        )
        self.assertEqual(user.username, "john")
        self.assertEqual(user.email, "john@example.com")
        self.assertTrue(user.is_authenticated)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_user_email_unique(self):
        PlataformaUser.objects.create(
            username="john",
            password="x",
            email="john@example.com"
        )
        with self.assertRaises(IntegrityError):
            PlataformaUser.objects.create(
                username="mary",
                password="x",
                email="john@example.com"
            )

    def test_user_id_property_equals_username(self):
        user = PlataformaUser.objects.create(
            username="john",
            password="x",
            email="john@example.com"
        )
        self.assertEqual(user.id, "john")

    def test_plataformauser_max_length(self):
        PlataformaUser(username="u" * 128, password="pass", email="a@b.com").full_clean()
        with self.assertRaises(ValidationError):
            PlataformaUser(username="u" * 129, password="pass", email="x@y.com").full_clean()

    def test_required_fields(self):
        with self.assertRaises(ValidationError):
            PlataformaUser(username="john", password="123", email=None).full_clean()

############################################
# Genre Tests
############################################
class TestGenre(TestCase):

    def test_create_genre(self):
        genre = Genre.objects.create(gerne_name="Action")
        self.assertEqual(genre.gerne_name, "Action")

############################################
# Director Tests
############################################
class TestDirector(TestCase):

    def test_create_director(self):
        director = Director.objects.create(
            name="Tarantino",
            biography="Famous director"
        )
        self.assertEqual(director.name, "Tarantino")
        self.assertEqual(director.biography, "Famous director")

    def test_director_name_max_length(self):
        Director(name="a" * 128).full_clean()
        with self.assertRaises(ValidationError):
            Director(name="a" * 129).full_clean()

    def test_director_bio_blank(self):
        Director(name="Nolan", biography="").full_clean()

############################################
# Movie Tests
############################################
class TestMovie(TestCase):

    def test_create_movie(self):
        movie = Movie.objects.create(
            title="Matrix",
            description="Sci-fi film",
            release_date="1999-03-31",
            rating=9.0,
            total_ratings=100,
            image="matrix.jpg"
        )
        self.assertEqual(movie.title, "Matrix")
        self.assertEqual(movie.rating, 9.0)

    def test_movie_title_max_length(self):
        Movie(
            title="a" * 256,
            description="d",
            release_date=date.today(),
            rating=5,
            total_ratings=1
        ).full_clean()
        with self.assertRaises(ValidationError):
            Movie(
                title="a" * 257,
                description="d",
                release_date=date.today(),
                rating=5,
                total_ratings=1
            ).full_clean()

    def test_movie_image_blank_or_null(self):
        Movie(
            title="T1",
            description="d",
            release_date=date.today(),
            rating=5,
            total_ratings=1,
            image=""
        ).full_clean()
        Movie(
            title="T2",
            description="d",
            release_date=date.today(),
            rating=5,
            total_ratings=1,
            image=None
        ).full_clean()

    def test_movie_genre_relationship(self):
        g1 = Genre.objects.create(gerne_name="Action")
        movie = Movie.objects.create(
            title="Matrix",
            description="Sci-fi film",
            release_date="1999-03-31",
            rating=9.0,
            total_ratings=100
        )
        GenreMovie.objects.create(genre=g1, movie=movie)
        self.assertEqual(movie.genres.first(), g1)

    def test_movie_director_relationship(self):
        d1 = Director.objects.create(name="Wachowski", biography="Director")
        movie = Movie.objects.create(
            title="Matrix",
            description="Sci-fi film",
            release_date="1999-03-31",
            rating=9.0,
            total_ratings=100
        )
        MovieDirector.objects.create(director=d1, movie=movie)
        self.assertEqual(movie.directors.first(), d1)

    def test_cascade_genre_movie(self):
        g = Genre.objects.create(gerne_name="Horror")
        m = Movie.objects.create(title="X", description="d", release_date=date.today(), rating=4, total_ratings=1)
        GenreMovie.objects.create(genre=g, movie=m)
        g.delete()
        self.assertEqual(GenreMovie.objects.count(), 0)

    def test_cascade_movie_director(self):
        d = Director.objects.create(name="Dir")
        m = Movie.objects.create(title="X", description="d", release_date=date.today(), rating=4, total_ratings=1)
        MovieDirector.objects.create(movie=m, director=d)
        m.delete()
        self.assertEqual(MovieDirector.objects.count(), 0)

############################################
# Review Tests
############################################
class TestReview(TestCase):

    def test_create_review(self):
        user = PlataformaUser.objects.create(username="john", password="x", email="john@example.com")
        movie = Movie.objects.create(title="Matrix", description="Sci-fi film", release_date="1999-03-31", rating=9.0, total_ratings=100)
        review = Review.objects.create(user=user, movie=movie, rating=8.5, description="Great!")
        self.assertEqual(review.rating, 8.5)
        self.assertEqual(review.user, user)
        self.assertEqual(review.movie, movie)
        self.assertIsNotNone(review.created_at)

    def test_review_description_blank(self):
        user = PlataformaUser.objects.create(username="john", password="x", email="john@example.com")
        movie = Movie.objects.create(title="X", description="d", release_date="1999-03-31", rating=5, total_ratings=2)
        Review(user=user, movie=movie, rating=5, description="").full_clean()

    def test_review_unique_together(self):
        user = PlataformaUser.objects.create(username="john", password="x", email="john@example.com")
        movie = Movie.objects.create(title="Matrix", description="Sci-fi film", release_date="1999-03-31", rating=9.0, total_ratings=100)
        Review.objects.create(user=user, movie=movie, rating=9)
        with self.assertRaises(IntegrityError):
            Review.objects.create(user=user, movie=movie, rating=7)
