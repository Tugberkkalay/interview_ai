# Generated migration for SupportSession model

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('interview_api', '0009_remove_old_quota_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='SupportSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_id', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, help_text='Unique session identifier', unique=True)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('ended_at', models.DateTimeField(blank=True, null=True)),
                ('duration_seconds', models.IntegerField(default=0, help_text='Session duration in seconds')),
                ('transcript', models.JSONField(default=list, help_text='Full conversation transcript')),
                ('has_demo_request', models.BooleanField(default=False, help_text='Whether a demo request was made during this session')),
                ('demo_request_data', models.JSONField(blank=True, default=dict, help_text='Demo request data if any')),
                ('closure_reason', models.CharField(choices=[('manual', 'Kullanıcı Manuel Kapattı'), ('ai_requested', 'AI Tarafından Kapatıldı'), ('network_error', 'Ağ Hatası'), ('server_error', 'Sunucu Hatası'), ('timeout', 'Zaman Aşımı'), ('unknown', 'Bilinmeyen')], default='unknown', help_text='How the session ended', max_length=20)),
                ('closure_details', models.TextField(blank=True, help_text='Additional details about session closure')),
                ('user_ip', models.GenericIPAddressField(blank=True, help_text='User IP address', null=True)),
                ('user_agent', models.TextField(blank=True, help_text='User agent string')),
                ('is_completed', models.BooleanField(default=False, help_text='Whether session completed successfully')),
            ],
            options={
                'ordering': ['-started_at'],
            },
        ),
        migrations.AddIndex(
            model_name='supportsession',
            index=models.Index(fields=['session_id'], name='interview_a_session_6a8b2c_idx'),
        ),
        migrations.AddIndex(
            model_name='supportsession',
            index=models.Index(fields=['started_at'], name='interview_a_started_8f3d4e_idx'),
        ),
        migrations.AddIndex(
            model_name='supportsession',
            index=models.Index(fields=['has_demo_request'], name='interview_a_has_dem_7c9e5f_idx'),
        ),
        migrations.AddIndex(
            model_name='supportsession',
            index=models.Index(fields=['closure_reason'], name='interview_a_closure_9d2e3a_idx'),
        ),
    ]

