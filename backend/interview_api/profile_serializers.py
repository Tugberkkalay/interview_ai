"""
Profile Authentication Serializers
"""
from rest_framework import serializers
from .profile_models import Profile
from django.contrib.auth import authenticate


class ProfileRegistrationSerializer(serializers.Serializer):
    """Register new profile"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=200)
    company_name = serializers.CharField(max_length=200)
    website = serializers.URLField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    def validate_email(self, value):
        if Profile.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu email zaten kayıtlı.")
        return value
    
    def create(self, validated_data):
        profile = Profile.objects.create_profile(**validated_data)
        return profile


class ProfileLoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            try:
                profile = Profile.objects.get(email=email)
                if profile.check_password(password):
                    if not profile.is_active:
                        raise serializers.ValidationError("Hesap devre dışı.")
                    data['profile'] = profile
                else:
                    raise serializers.ValidationError("Email veya şifre hatalı.")
            except Profile.DoesNotExist:
                raise serializers.ValidationError("Email veya şifre hatalı.")
        else:
            raise serializers.ValidationError("Email ve şifre gerekli.")
        
        return data


class ProfileSerializer(serializers.ModelSerializer):
    """Profile details"""
    credits_remaining = serializers.SerializerMethodField()
    credits_percentage = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()
    # Backward compatibility fields (deprecated, use credits_* instead)
    quota_monthly = serializers.IntegerField(source='credits_total', read_only=True)
    quota_used_this_month = serializers.IntegerField(source='credits_used', read_only=True)
    quota_remaining = serializers.SerializerMethodField()
    quota_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            'id',
            'email',
            'full_name',
            'company_name',
            'website',
            'phone',
            'logo',
            'api_key',
            'api_key_created_at',
            'api_key_last_used',
            'plan',
            'credits_total',
            'credits_used',
            'credits_remaining',
            'credits_percentage',
            # Backward compatibility
            'quota_monthly',
            'quota_used_this_month',
            'quota_remaining',
            'quota_percentage',
            'is_active',
            'created_at',
            'last_login'
        ]
        read_only_fields = [
            'id',
            'email',
            'full_name',
            'api_key',
            'api_key_created_at',
            'api_key_last_used',
            'credits_used',
            'created_at',
            'last_login'
        ]
    
    def get_credits_remaining(self, obj):
        if obj.plan == 'enterprise':
            return 999999  # Sınırsız
        return obj.credits_total - obj.credits_used
    
    def get_credits_percentage(self, obj):
        if obj.plan == 'enterprise':
            return 0
        if obj.credits_total == 0:
            return 0
        return round((obj.credits_used / obj.credits_total) * 100, 1)
    
    # Backward compatibility methods
    def get_quota_remaining(self, obj):
        return self.get_credits_remaining(obj)
    
    def get_quota_percentage(self, obj):
        return self.get_credits_percentage(obj)
    
    def get_logo(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


class SessionStatsSerializer(serializers.Serializer):
    """Session statistics"""
    total_sessions = serializers.IntegerField()
    completed_sessions = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    total_duration_minutes = serializers.IntegerField()
    average_duration_minutes = serializers.FloatField()
    sessions_today = serializers.IntegerField()
    sessions_this_week = serializers.IntegerField()
    sessions_this_month = serializers.IntegerField()


class DailyUsageSerializer(serializers.Serializer):
    """Daily usage data for charts"""
    date = serializers.DateField()
    count = serializers.IntegerField()
    total_duration_minutes = serializers.IntegerField()

