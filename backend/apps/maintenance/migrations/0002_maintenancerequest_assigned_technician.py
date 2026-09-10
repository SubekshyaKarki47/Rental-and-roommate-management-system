from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maintenance', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='maintenancerequest',
            name='assigned_technician',
            field=models.CharField(blank=True, max_length=200),
        ),
    ]
