from django.db import models

# Create your models here.


class PlataformaUser(models.Model):
    username = models.CharField(max_length=128, primary_key=True)
    password = models.CharField(max_length=128)
    email = models.CharField(max_length=128, unique=True)

    class Meta:
        db_table = 'plataformuser'
        
class Genre(models.Model):
    gerne_name = models.CharField(max_length=128, db_column='gerne_name')
    class Meta:
        db_table = 'genre'

class Director(models.Model):
    name = models.CharField(max_length=128)
    biography = models.TextField(blank=True)
    class Meta:
        db_table = 'director'

class Movie(models.Model):
    title = models.CharField(max_length=256)
    description = models.TextField()
    release_date = models.DateField()
    rating = models.FloatField()
    total_ratings = models.IntegerField()
    genres = models.ManyToManyField(Genre, through='GenreMovie')
    directors = models.ManyToManyField(Director, through='MovieDirector')
    class Meta:
        db_table = 'movie'

class GenreMovie(models.Model):
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    class Meta:
        db_table = 'genre_movie'
        unique_together = (('genre', 'movie'),)

class MovieDirector(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    director = models.ForeignKey(Director, on_delete=models.CASCADE)
    class Meta:
        db_table = 'movie_director'
        unique_together = (('movie', 'director'),)

        
