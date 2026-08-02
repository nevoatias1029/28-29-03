package com.studentregistration.dto;

import java.util.List;

public record StudentDto(
        Long id,
        String name,
        String email,
        List<String> enrolledCourses
) {
}
