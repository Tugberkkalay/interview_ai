# Generated migration for SupportSession summary field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('interview_api', '0011_rename_interview_a_session_6a8b2c_idx_interview_a_session_183937_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='supportsession',
            name='summary',
            field=models.TextField(blank=True, help_text='AI-generated summary of the conversation'),
        ),
    ]

