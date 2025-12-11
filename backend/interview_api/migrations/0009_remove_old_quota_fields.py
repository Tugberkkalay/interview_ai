# Generated migration to remove old quota fields (quota_monthly, quota_used_this_month, quota_reset_date)

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('interview_api', '0008_migrate_to_credit_system'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='quota_monthly',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='quota_used_this_month',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='quota_reset_date',
        ),
    ]

