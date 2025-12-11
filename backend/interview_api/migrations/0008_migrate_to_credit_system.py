# Generated migration to migrate from monthly quota to credit system

from django.db import migrations, models


def migrate_quota_to_credits(apps, schema_editor):
    """Migrate quota data to credit system"""
    Profile = apps.get_model('interview_api', 'Profile')
    
    for profile in Profile.objects.all():
        # Migrate quota to credits
        profile.credits_total = profile.quota_monthly if hasattr(profile, 'quota_monthly') else 5
        profile.credits_used = profile.quota_used_this_month if hasattr(profile, 'quota_used_this_month') else 0
        
        # Set credits based on plan if default values
        if profile.credits_total == 10 and profile.credits_used == 0:  # Old free plan default
            plan_credits = {
                'free': 5,
                'starter': 20,
                'growth': 100,
                'enterprise': 999999,
            }
            profile.credits_total = plan_credits.get(profile.plan, 5)
        
        # Update plan names if needed
        if profile.plan == 'pro':
            profile.plan = 'starter'
        
        profile.save()


class Migration(migrations.Migration):

    dependencies = [
        ('interview_api', '0007_add_logo_field'),
    ]

    operations = [
        # Add new credit fields
        migrations.AddField(
            model_name='profile',
            name='credits_total',
            field=models.IntegerField(
                default=5,
                help_text='Toplam kredi sayısı (1 Kredi = 1 Mülakat)'
            ),
        ),
        migrations.AddField(
            model_name='profile',
            name='credits_used',
            field=models.IntegerField(
                default=0,
                help_text='Kullanılan kredi sayısı'
            ),
        ),
        # Update plan choices
        migrations.AlterField(
            model_name='profile',
            name='plan',
            field=models.CharField(
                choices=[
                    ('free', 'Free (5 Kredi Hediye)'),
                    ('starter', 'Starter (20 Kredi)'),
                    ('growth', 'Growth (100 Kredi)'),
                    ('enterprise', 'Enterprise (Sınırsız)'),
                ],
                default='free',
                help_text='Paket tipi: free, starter, growth, enterprise',
                max_length=20
            ),
        ),
        # Migrate data: copy quota_monthly to credits_total, quota_used_this_month to credits_used
        migrations.RunPython(
            code=migrate_quota_to_credits,
            reverse_code=migrations.RunPython.noop,
        ),
        # Keep old fields for backward compatibility (we'll remove them later if needed)
        # For now, we keep quota_monthly, quota_used_this_month, quota_reset_date
        # They can be removed in a future migration after ensuring all code is updated
    ]

