package com.studentregistration.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EnrollmentRequest(
        @NotNull(message = "studentId is required")
        Long studentId,

        @NotBlank(message = "courseId is required")
        String courseId
) {
}
