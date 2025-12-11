# Generated manually for adding logo field to Profile

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('interview_api', '0006_remove_legacy_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='logo',
            field=models.ImageField(blank=True, help_text='Company logo image', null=True, upload_to='logos/'),
        ),
    ]

