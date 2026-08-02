package com.studentregistration.service;

import com.studentregistration.dto.NewStudentRequest;
import com.studentregistration.dto.StudentDto;
import com.studentregistration.entity.Student;
import com.studentregistration.exception.DuplicateEmailException;
import com.studentregistration.exception.NotFoundException;
import com.studentregistration.repository.EnrollmentRepository;
import com.studentregistration.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;

    public StudentService(StudentRepository studentRepository, EnrollmentRepository enrollmentRepository) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional(readOnly = true)
    public List<StudentDto> listStudents() {
        return studentRepository.findAll().stream().map(this::toDto).toList();
    }

    public StudentDto addStudent(NewStudentRequest request) {
        String name = request.name().trim();
        String email = request.email().trim();
        if (studentRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException("This email is already registered");
        }
        Student student = new Student();
        student.setName(name);
        student.setEmail(email);
        Student saved = studentRepository.save(student);
        return toDto(saved);
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new NotFoundException("Student not found");
        }
        enrollmentRepository.deleteByStudentId(id);
        studentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentDto(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Student not found"));
        return toDto(student);
    }

    private StudentDto toDto(Student student) {
        List<String> enrolledCourses = enrollmentRepository.findCourseIdsByStudentId(student.getId());
        return new StudentDto(student.getId(), student.getName(), student.getEmail(), enrolledCourses);
    }
}
