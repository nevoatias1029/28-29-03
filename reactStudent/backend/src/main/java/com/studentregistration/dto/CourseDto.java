package com.studentregistration.dto;

public record CourseDto(
        String id,
        String title,
        String category,
        String description,
        String duration,
        String level,
        int maxStudents,
        long enrolledCount
) {
}
