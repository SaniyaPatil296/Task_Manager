from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task model.
    Handles field validation, formatting, and read-only attributes.
    """
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',
            'due_date',
            'owner',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be blank or contain only whitespace.")
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        return value.strip()

    def validate_status(self, value):
        valid_statuses = [choice.value for choice in Task.StatusChoices]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Invalid status '{value}'. Allowed choices: {', '.join(valid_statuses)}."
            )
        return value

    def validate_priority(self, value):
        valid_priorities = [choice.value for choice in Task.PriorityChoices]
        if value not in valid_priorities:
            raise serializers.ValidationError(
                f"Invalid priority '{value}'. Allowed choices: {', '.join(valid_priorities)}."
            )
        return value
