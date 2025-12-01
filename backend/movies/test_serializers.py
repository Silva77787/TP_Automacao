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
from django.test import TestCase, RequestFactory
from rest_framework.permissions import SAFE_METHODS
from movies.permissions import IsOwnerOrReadOnly
from movies.permissions import IsAuthenticated

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




############################################
# IsOwnerOrReadOnly Tests (Permissions)
############################################


class TestIsOwnerOrReadOnly(TestCase):

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = IsOwnerOrReadOnly()
        self.user_owner = PlataformaUser.objects.create(
            username="owner",
            password="123",
            email="owner@test.com"
        )
        self.user_other = PlataformaUser.objects.create(
            username="other",
            password="123",
            email="other@test.com"
        )

    def test_read_permission_allowed_for_anyone(self):
        request = self.factory.get("/")
        request.user = self.user_other  # user diferente do owner

        result = self.permission.has_object_permission(
            request,
            None,
            self.user_owner 
        )

        self.assertTrue(result)

    def test_write_permission_allowed_for_owner(self):
        request = self.factory.put("/")
        request.user = self.user_owner

        result = self.permission.has_object_permission(
            request,
            None,
            self.user_owner
        )

        self.assertTrue(result)

    def test_write_permission_denied_for_non_owner(self):
        request = self.factory.put("/")
        request.user = self.user_other

        result = self.permission.has_object_permission(
            request,
            None,
            self.user_owner
        )

        self.assertFalse(result)


############################################
# IsAuthenticated Tests (Permissions)
############################################

class TestIsAuthenticated(TestCase):

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = IsAuthenticated()

        self.user = PlataformaUser.objects.create(
            username="john",
            password="abc",
            email="john@test.com"
        )

    def test_allow_authenticated_user(self):
        request = self.factory.get("/")
        request.user = self.user
        
        result = self.permission.has_permission(request, None)
        self.assertTrue(result)

    def test_deny_if_no_user(self):
        request = self.factory.get("/")
        request.user = None  # sem user
        
        result = self.permission.has_permission(request, None)
        self.assertFalse(result)