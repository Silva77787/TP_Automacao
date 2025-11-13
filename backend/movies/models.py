from django.db import models

# Create your models here.


class PlataformaUser(models.Model):
    username = models.CharField(max_length=128, primary_key=True)
    password = models.CharField(max_length=128)
    email = models.CharField(max_length=128, unique=True)

    class Meta:
        db_table = 'plataformuser'

        