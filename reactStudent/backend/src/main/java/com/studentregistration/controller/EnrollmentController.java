package com.studentregistration.controller;

import com.studentregistration.dto.EnrollmentRequest;
import com.studentregistration.dto.StudentDto;
import com.studentregistration.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public StudentDto enroll(@Valid @RequestBody EnrollmentRequest request) {
        return enrollmentService.enroll(request);
    }

    @DeleteMapping("/{studentId}/{courseId}")
    public StudentDto unenroll(@PathVariable Long studentId, @PathVariable String courseId) {
        return enrollmentService.unenroll(studentId, courseId);
    }
}
