# Generated by Django 4.1.1 on 2023-02-28 23:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plan', '0015_remove_scenario_max_budget_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='scenario',
            name='favorited',
            field=models.BooleanField(default=False, null=True),
        ),
    ]