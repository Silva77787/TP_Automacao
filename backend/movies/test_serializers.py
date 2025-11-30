from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import check_password
from movies.serializers import (
    GenreSerializer, DirectorSerializer, MovieSerializer,
    UserRegistrationSerializer, UserDetailSerializer,
    UserUpdateSerializer, ReviewSerializer, MovieDetailSerializer
)
from movies.models import Genre, Director, Movie, PlataformaUser, Review
from datetime import date

############################################
# GenreSerializer Tests
############################################
class TestGenreSerializer(TestCase):

    def test_genre_serializer(self):
        genre = Genre.objects.create(gerne_name="Action")
        serializer = GenreSerializer(genre)
        self.assertEqual(serializer.data["gerne_name"], "Action")

############################################
# DirectorSerializer Tests
############################################
class TestDirectorSerializer(TestCase):

    def test_director_serializer(self):
        director = Director.objects.create(name="Nolan", biography="Bio")
        serializer = DirectorSerializer(director)
        self.assertEqual(serializer.data["name"], "Nolan")
        self.assertEqual(serializer.data["biography"], "Bio")

############################################
# MovieSerializer Tests
############################################
class TestMovieSerializer(TestCase):

    def test_movie_serializer(self):
        movie = Movie.objects.create(
            title="Matrix",
            description="Sci-fi",
            release_date="1999-03-31",
            rating=9.0,
            total_ratings=120,
            image="matrix.jpg"
        )
        serializer = MovieSerializer(movie)
        self.assertEqual(serializer.data["title"], "Matrix")
        self.assertIn("genres", serializer.data)
        self.assertIn("directors", serializer.data)

############################################
# UserRegistrationSerializer Tests
############################################
class TestUserRegistrationSerializer(TestCase):

    def test_successful_registration(self):
        data = {
            "username": "john",
            "email": "john@example.com",
            "password": "12345",
            "password_confirm": "12345"
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, "john")
        self.assertTrue(check_password("12345", user.password))

    def test_password_mismatch(self):
        data = {
            "username": "john",
            "email": "john@example.com",
            "password": "12345",
            "password_confirm": "wrong"
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_duplicate_username(self):
        PlataformaUser.objects.create(username="john", email="a@a.com", password="x")
        data = {
            "username": "john",
            "email": "new@mail.com",
            "password": "abc",
            "password_confirm": "abc"
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("username", serializer.errors)

    def test_duplicate_email(self):
        PlataformaUser.objects.create(username="u1", email="john@example.com", password="x")
        data = {
            "username": "new",
            "email": "john@example.com",
            "password": "abc",
            "password_confirm": "abc"
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

############################################
# UserUpdateSerializer Tests
############################################
class TestUserUpdateSerializer(TestCase):

    def test_update_email(self):
        user = PlataformaUser.objects.create(username="john", email="old@mail.com", password="x")
        serializer = UserUpdateSerializer(user, data={"email": "new@mail.com"}, partial=True)
        self.assertTrue(serializer.is_valid())
        updated = serializer.save()
        self.assertEqual(updated.email, "new@mail.com")

    def test_update_password(self):
        user = PlataformaUser.objects.create(username="john", email="a@mail.com", password="x")
        data = {"password": "1234", "password_confirm": "1234"}
        serializer = UserUpdateSerializer(user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated = serializer.save()
        self.assertTrue(check_password("1234", updated.password))

    def test_password_mismatch(self):
        user = PlataformaUser.objects.create(username="john", email="a@mail.com", password="x")
        data = {"password": "1234", "password_confirm": "wrong"}
        serializer = UserUpdateSerializer(user, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

############################################
# ReviewSerializer Tests
############################################
class TestReviewSerializer(TestCase):

    def test_review_serializer(self):
        user = PlataformaUser.objects.create(username="john", email="x@mail.com", password="x")
        movie = Movie.objects.create(title="X", description="d", release_date=date.today(), rating=5, total_ratings=1)
        review = Review.objects.create(user=user, movie=movie, rating=8, description="Good")

        serializer = ReviewSerializer(review)
        self.assertEqual(serializer.data["username"], "john")
        self.assertEqual(serializer.data["rating"], 8)
        self.assertIn("created_at", serializer.data)

############################################
# MovieDetailSerializer Tests
############################################
class TestMovieDetailSerializer(TestCase):

    def test_movie_detail_reviews(self):
        movie = Movie.objects.create(title="X", description="d", release_date=date.today(), rating=5, total_ratings=1)
        user = PlataformaUser.objects.create(username="john", email="x@mail.com", password="pass")
        Review.objects.create(user=user, movie=movie, rating=9, description="Nice")

        serializer = MovieDetailSerializer(movie)
        self.assertEqual(len(serializer.data["reviews"]), 1)
        self.assertEqual(serializer.data["reviews"][0]["rating"], 9)
