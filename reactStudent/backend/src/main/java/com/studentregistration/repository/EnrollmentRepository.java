package com.studentregistration.repository;

import com.studentregistration.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    long countByCourseId(String courseId);

    boolean existsByStudentIdAndCourseId(Long studentId, String courseId);

    void deleteByStudentIdAndCourseId(Long studentId, String courseId);

    void deleteByStudentId(Long studentId);

    @Query("select e.course.id from Enrollment e where e.student.id = :studentId")
    List<String> findCourseIdsByStudentId(@Param("studentId") Long studentId);
}
