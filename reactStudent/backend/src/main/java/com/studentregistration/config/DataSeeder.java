package com.studentregistration.config;

import com.studentregistration.entity.Course;
import com.studentregistration.entity.Enrollment;
import com.studentregistration.entity.Student;
import com.studentregistration.repository.CourseRepository;
import com.studentregistration.repository.EnrollmentRepository;
import com.studentregistration.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the database with the same course catalog and initial students that used to
 * live in the frontend's src/data.js, so the site looks the same on first run.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;

    public DataSeeder(CourseRepository courseRepository, StudentRepository studentRepository,
                       EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    public void run(String... args) {
        if (courseRepository.count() == 0) {
            seedCourses();
        }
        if (studentRepository.count() == 0) {
            seedStudents();
        }
    }

    private void seedCourses() {
        List<Course> courses = List.of(
                course("cs101", "Full-Stack Web Development", "tech",
                        "Master React, Node.js, databases, and deployment. Build production-ready web applications from scratch.",
                        "16 weeks", "Intermediate", 30),
                course("cs102", "Machine Learning & AI", "data",
                        "Explore neural networks, deep learning, NLP, and computer vision using Python and TensorFlow.",
                        "20 weeks", "Advanced", 25),
                course("cs103", "Cybersecurity Fundamentals", "tech",
                        "Learn ethical hacking, network security, cryptography, and vulnerability assessment techniques.",
                        "12 weeks", "Beginner", 35),
                course("ds201", "Data Science with Python", "data",
                        "Analyze real-world datasets using pandas, NumPy, matplotlib, and statistical modeling.",
                        "14 weeks", "Intermediate", 30),
                course("cr301", "UX/UI Design Mastery", "creative",
                        "Design intuitive user experiences with Figma, design systems, prototyping, and user research.",
                        "10 weeks", "Beginner", 25),
                course("cr302", "3D Animation & Motion Graphics", "creative",
                        "Create stunning 3D animations using Blender, After Effects, and motion design principles.",
                        "18 weeks", "Intermediate", 20),
                course("bs401", "Digital Marketing Strategy", "business",
                        "Master SEO, social media marketing, content strategy, analytics, and paid advertising.",
                        "8 weeks", "Beginner", 40),
                course("bs402", "Product Management", "business",
                        "Learn agile methodologies, roadmap planning, stakeholder management, and product-led growth.",
                        "12 weeks", "Intermediate", 30),
                course("sc501", "Blockchain & Web3 Development", "tech",
                        "Build decentralized apps with Solidity, smart contracts, and blockchain architecture.",
                        "14 weeks", "Advanced", 20),
                course("sc502", "Cloud Architecture (AWS)", "tech",
                        "Design scalable cloud solutions with AWS services, serverless computing, and DevOps practices.",
                        "16 weeks", "Intermediate", 30),
                course("cr303", "Game Development with Unity", "creative",
                        "Create 2D and 3D games using Unity, C#, game physics, and interactive storytelling.",
                        "20 weeks", "Intermediate", 25),
                course("sc503", "Quantum Computing Basics", "science",
                        "Introduction to quantum mechanics principles, qubits, quantum gates, and quantum algorithms.",
                        "10 weeks", "Advanced", 15)
        );
        courseRepository.saveAll(courses);
    }

    private Course course(String id, String title, String category, String description,
                           String duration, String level, int maxStudents) {
        Course c = new Course();
        c.setId(id);
        c.setTitle(title);
        c.setCategory(category);
        c.setDescription(description);
        c.setDuration(duration);
        c.setLevel(level);
        c.setMaxStudents(maxStudents);
        return c;
    }

    private void seedStudents() {
        Student emma = student("Emma Johnson", "emma.johnson@mail.com");
        Student liam = student("Liam Chen", "liam.chen@mail.com");
        Student sofia = student("Sofia Martinez", "sofia.m@mail.com");
        Student noah = student("Noah Williams", "noah.w@mail.com");
        Student ava = student("Ava Patel", "ava.patel@mail.com");
        Student ethan = student("Ethan Kim", "ethan.k@mail.com");

        enroll(emma, "cs101", "cr301");
        enroll(liam, "cs102", "ds201");
        enroll(sofia, "cr301", "cr302", "bs401");
        enroll(noah, "cs101", "sc502");
        enroll(ava, "bs401", "bs402", "cs103");
        enroll(ethan, "cs102", "sc501", "sc503");
    }

    private Student student(String name, String email) {
        Student s = new Student();
        s.setName(name);
        s.setEmail(email);
        return studentRepository.save(s);
    }

    private void enroll(Student student, String... courseIds) {
        for (String courseId : courseIds) {
            Course course = courseRepository.findById(courseId).orElseThrow();
            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setCourse(course);
            enrollmentRepository.save(enrollment);
        }
    }
}
