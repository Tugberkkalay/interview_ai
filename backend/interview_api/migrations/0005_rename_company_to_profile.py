# Generated manually for renaming Company to Profile

from django.db import migrations, models
import django.db.models.deletion


def populate_full_name(apps, schema_editor):
    """Populate full_name from company_name for existing records"""
    Company = apps.get_model('interview_api', 'Company')
    for company in Company.objects.all():
        company.full_name = company.company_name
        company.save()


class Migration(migrations.Migration):

    dependencies = [
        ('interview_api', '0004_company_interviewsession_duration_seconds_and_more'),
    ]

    operations = [
        # Add full_name field first (nullable, will be populated)
        migrations.AddField(
            model_name='company',
            name='full_name',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        # Populate full_name from company_name for existing records
        migrations.RunPython(
            code=populate_full_name,
            reverse_code=migrations.RunPython.noop,
        ),
        # Make full_name required
        migrations.AlterField(
            model_name='company',
            name='full_name',
            field=models.CharField(max_length=200),
        ),
        # Rename model from Company to Profile
        migrations.RenameModel(
            old_name='Company',
            new_name='Profile',
        ),
        # Remove contact_person field
        migrations.RemoveField(
            model_name='profile',
            name='contact_person',
        ),
        # Update ForeignKey reference (field name stays 'company' for backward compatibility)
        migrations.AlterField(
            model_name='interviewsession',
            name='company',
            field=models.ForeignKey(
                blank=True,
                help_text='Profile that owns this session',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='sessions',
                to='interview_api.profile'
            ),
        ),
        # Update Meta options
        migrations.AlterModelOptions(
            name='profile',
            options={
                'verbose_name': 'Profile',
                'verbose_name_plural': 'Profiles',
                'ordering': ['-created_at'],
            },
        ),
    ]

