package com.studentregistration.service;

import com.studentregistration.dto.CourseDto;
import com.studentregistration.repository.CourseRepository;
import com.studentregistration.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public List<CourseDto> listCourses() {
        return courseRepository.findAll().stream()
                .map(course -> new CourseDto(
                        course.getId(),
                        course.getTitle(),
                        course.getCategory(),
                        course.getDescription(),
                        course.getDuration(),
                        course.getLevel(),
                        course.getMaxStudents(),
                        enrollmentRepository.countByCourseId(course.getId())
                ))
                .toList();
    }
}
