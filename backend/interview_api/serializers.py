from rest_framework import serializers
from .models import InterviewSession

# InterviewDataSerializer removed - data comes from ATS, not stored in database


class ReportSubmissionSerializer(serializers.Serializer):
    """
    Serializer for receiving interview report from frontend
    """
    report = serializers.JSONField()

    def validate_report(self, value):
        """
        Validate that report contains required fields
        """
        required_fields = [
            'candidateName',
            'overallScore',
            'categoryScores',
            'summary',
            'hiringRecommendation'
        ]
        
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(
                    f"Report eksik alan: {field}"
                )
        
        return value


class InterviewSessionAdminSerializer(serializers.ModelSerializer):
    """
    Serializer for admin panel - shows all fields
    """
    is_expired = serializers.BooleanField(read_only=True)
    is_accessible = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = InterviewSession
        fields = '__all__'
        read_only_fields = ['token', 'created_at', 'updated_at']

