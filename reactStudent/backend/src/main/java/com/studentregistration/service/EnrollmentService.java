package com.studentregistration.service;

import com.studentregistration.dto.EnrollmentRequest;
import com.studentregistration.dto.StudentDto;
import com.studentregistration.entity.Course;
import com.studentregistration.entity.Enrollment;
import com.studentregistration.entity.Student;
import com.studentregistration.exception.CourseFullException;
import com.studentregistration.exception.DuplicateEnrollmentException;
import com.studentregistration.exception.NotFoundException;
import com.studentregistration.repository.CourseRepository;
import com.studentregistration.repository.EnrollmentRepository;
import com.studentregistration.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EnrollmentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentService studentService;

    public EnrollmentService(StudentRepository studentRepository, CourseRepository courseRepository,
                              EnrollmentRepository enrollmentRepository, StudentService studentService) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.studentService = studentService;
    }

    public StudentDto enroll(EnrollmentRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Student not found"));
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course not found"));

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new DuplicateEnrollmentException("Student is already enrolled in this course");
        }

        long currentEnrollment = enrollmentRepository.countByCourseId(course.getId());
        if (currentEnrollment >= course.getMaxStudents()) {
            throw new CourseFullException("This course is full");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollmentRepository.save(enrollment);

        return studentService.getStudentDto(student.getId());
    }

    public StudentDto unenroll(Long studentId, String courseId) {
        if (!studentRepository.existsById(studentId)) {
            throw new NotFoundException("Student not found");
        }
        enrollmentRepository.deleteByStudentIdAndCourseId(studentId, courseId);
        return studentService.getStudentDto(studentId);
    }
}
