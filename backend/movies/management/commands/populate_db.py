from django.core.management.base import BaseCommand
from movies.models import Movie

class Command(BaseCommand):
    help = "Populates DB with genres and movies from TMDB if movie table is empty"

    def handle(self, *args, **options):
        from movies.utils import populate_database_if_empty
        result = populate_database_if_empty()
        self.stdout.write(self.style.SUCCESS(result))