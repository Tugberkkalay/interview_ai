# Generated manually for removing legacy fields (zero-knowledge architecture)

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('interview_api', '0005_rename_company_to_profile'),
    ]

    operations = [
        # Remove legacy fields (zero-knowledge: data comes from ATS, not stored)
        migrations.RemoveField(
            model_name='interviewsession',
            name='candidate_name',
        ),
        migrations.RemoveField(
            model_name='interviewsession',
            name='candidate_email',
        ),
        migrations.RemoveField(
            model_name='interviewsession',
            name='job_position',
        ),
        migrations.RemoveField(
            model_name='interviewsession',
            name='company_name',
        ),
        migrations.RemoveField(
            model_name='interviewsession',
            name='company_info',
        ),
        migrations.RemoveField(
            model_name='interviewsession',
            name='job_description',
        ),
        migrations.RemoveField(
            model_name='interviewsession',
            name='candidate_resume',
        ),
        migrations.RemoveField(
            model_name='interviewsession',
            name='avatar_id',
        ),
        migrations.RemoveField(
            model_name='interviewsession',
            name='report',
        ),
    ]

