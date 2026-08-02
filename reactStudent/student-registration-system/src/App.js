import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import './App.css';
import { AVATAR_COLORS } from './data';
import * as api from './api';

// --- Security: Input Sanitization ---

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // Strip angle brackets (prevent HTML injection)
    .replace(/javascript:/gi, '') // Strip javascript: protocol
    .replace(/on\w+=/gi, '') // Strip inline event handlers
    .trim();
}

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

function isValidEmail(email) {
  // RFC 5322 simplified email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

// --- Helper Functions ---

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// --- Toast Component (aria-live for screen readers) ---

function Toast({ toasts }) {
  return (
    <div
      className="toast-container"
      aria-live="polite"
      aria-atomic="false"
      role="log"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
          role="status"
        >
          <span className="toast-icon" aria-hidden="true">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

// --- Confirm Modal (Focus Trap + Escape + ARIA) ---

function ConfirmModal({ title, description, onConfirm, onCancel }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    // Save the previously focused element
    previousFocusRef.current = document.activeElement;

    // Focus the modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Cleanup: return focus when modal closes
    return () => {
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Handle Escape key & Focus trap
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      // Focus trap: keep Tab within modal
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onCancel]
  );

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        ref={modalRef}
        tabIndex={-1}
      >
        <h3 className="modal-title" id="modal-title">{title}</h3>
        <p className="modal-description" id="modal-description">{description}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Header Component ---

function Header({ studentCount, courseCount, enrollmentCount }) {
  return (
    <header className="header" aria-label="Application header">
      <div className="header-brand">
        <div className="header-logo" aria-hidden="true">N</div>
        <div>
          <div className="header-title">Course - Student Registration </div>
          <div className="header-subtitle"> Nevo Hub</div>
        </div>
      </div>
      <div className="header-stats" aria-label="Statistics summary">
        <div className="header-stat">
          <span className="header-stat-value" aria-label={`${studentCount} students`}>{studentCount}</span>
          <span className="header-stat-label">Students</span>
        </div>
        <div className="header-stat">
          <span className="header-stat-value" aria-label={`${courseCount} courses`}>{courseCount}</span>
          <span className="header-stat-label">Courses</span>
        </div>
        <div className="header-stat">
          <span className="header-stat-value" aria-label={`${enrollmentCount} enrollments`}>{enrollmentCount}</span>
          <span className="header-stat-label">Enrollments</span>
        </div>
      </div>
    </header>
  );
}

// --- Add Student Form (Validation + Sanitization + ARIA) ---

function AddStudentForm({ onAdd, existingEmails }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback(
    (fieldName, fieldEmail) => {
      const newErrors = {};
      const cleanName = fieldName !== undefined ? fieldName : name;
      const cleanEmail = fieldEmail !== undefined ? fieldEmail : email;

      if (touched.name || fieldName !== undefined) {
        if (!cleanName.trim()) {
          newErrors.name = 'Full name is required';
        } else if (cleanName.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        }
      }

      if (touched.email || fieldEmail !== undefined) {
        if (!cleanEmail.trim()) {
          newErrors.email = 'Email is required';
        } else if (!isValidEmail(cleanEmail.trim())) {
          newErrors.email = 'Please enter a valid email address';
        } else if (existingEmails.includes(cleanEmail.trim().toLowerCase())) {
          newErrors.email = 'This email is already registered';
        }
      }

      return newErrors;
    },
    [name, email, touched, existingEmails]
  );

  const handleNameChange = (e) => {
    const value = sanitizeInput(e.target.value).slice(0, MAX_NAME_LENGTH);
    setName(value);
    if (touched.name) {
      setErrors(validate(value, undefined));
    }
  };

  const handleEmailChange = (e) => {
    const value = sanitizeInput(e.target.value).slice(0, MAX_EMAIL_LENGTH);
    setEmail(value);
    if (touched.email) {
      setErrors(validate(undefined, value));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    const validationErrors = validate(name, email);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const success = await onAdd({ name: sanitizeInput(name.trim()), email: sanitizeInput(email.trim()) });
    if (success) {
      setName('');
      setEmail('');
      setErrors({});
      setTouched({});
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit} noValidate>
      <div className="add-form-title">
        <span className="add-form-title-icon" aria-hidden="true">+</span>
        Add New Student
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="student-name">Full Name</label>
        <input
          id="student-name"
          className={`form-input ${errors.name ? 'input-error' : ''}`}
          type="text"
          placeholder="e.g. John Doe"
          value={name}
          onChange={handleNameChange}
          onBlur={() => handleBlur('name')}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          autoComplete="name"
          maxLength={MAX_NAME_LENGTH}
        />
        {errors.name && (
          <div className="form-error" id="name-error" role="alert">
            {errors.name}
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="student-email">Email Address</label>
        <input
          id="student-email"
          className={`form-input ${errors.email ? 'input-error' : ''}`}
          type="email"
          placeholder="e.g. john@mail.com"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => handleBlur('email')}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          autoComplete="email"
          maxLength={MAX_EMAIL_LENGTH}
        />
        {errors.email && (
          <div className="form-error" id="email-error" role="alert">
            {errors.email}
          </div>
        )}
      </div>
      <button type="submit" className="btn btn-primary btn-full" id="add-student-btn">
        Add Student
      </button>
    </form>
  );
}

// --- Student Card in Sidebar ---

function StudentCard({ student, isActive, onClick, onDelete }) {
  return (
    <div
      className={`student-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={isActive}
      aria-label={`${student.name}, ${student.email}, ${student.enrolledCourses.length} courses enrolled`}
    >
      <div
        className="student-avatar"
        style={{ background: getAvatarColor(student.id) }}
        aria-hidden="true"
      >
        {getInitials(student.name)}
      </div>
      <div className="student-card-info">
        <div className="student-card-name">{student.name}</div>
        <div className="student-card-email">{student.email}</div>
      </div>
      <span className="student-card-badge" aria-hidden="true">
        {student.enrolledCourses.length} {student.enrolledCourses.length === 1 ? 'course' : 'courses'}
      </span>
      <button
        className="student-card-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(student.id);
        }}
        title="Delete student"
        aria-label={`Delete ${student.name}`}
      >
        ×
      </button>
    </div>
  );
}

// --- Course Card ---

function CourseCard({ course, students, onEnroll, onUnenroll }) {
  const [selectedStudent, setSelectedStudent] = useState('');

  const enrolledStudents = students.filter((s) =>
    s.enrolledCourses.includes(course.id)
  );

  const availableStudents = students.filter(
    (s) => !s.enrolledCourses.includes(course.id)
  );

  const handleEnroll = () => {
    if (!selectedStudent) return;
    onEnroll(selectedStudent, course.id);
    setSelectedStudent('');
  };

  return (
    <article className="course-card" id={`course-${course.id}`} aria-labelledby={`course-title-${course.id}`}>
      <div className="course-card-header">
        <div>
          <div className="course-card-title" id={`course-title-${course.id}`}>{course.title}</div>
        </div>
        <span className={`course-card-category category-${course.category}`}>
          {course.category}
        </span>
      </div>
      <p className="course-card-description">{course.description}</p>
      <div className="course-card-meta">
        <span className="course-meta-item">
          {course.duration}
        </span>
        <span className="course-meta-item">
          {course.level}
        </span>
        <span className="course-meta-item" aria-label={`${enrolledStudents.length} of ${course.maxStudents} spots filled`}>
          {enrolledStudents.length}/{course.maxStudents}
        </span>
      </div>

      <div className="course-card-students">
        <div className="course-students-title">
          Enrolled Students
          <span className="student-count" aria-hidden="true">
            {enrolledStudents.length} enrolled
          </span>
        </div>
        {enrolledStudents.length > 0 ? (
          <div className="enrolled-students" role="list" aria-label={`Students enrolled in ${course.title}`}>
            {enrolledStudents.map((student) => (
              <span key={student.id} className="enrolled-student-chip" role="listitem">
                <span
                  className="chip-avatar"
                  style={{ background: getAvatarColor(student.id) }}
                  aria-hidden="true"
                >
                  {getInitials(student.name)}
                </span>
                {student.name.split(' ')[0]}
                <button
                  className="chip-remove"
                  onClick={() => onUnenroll(student.id, course.id)}
                  title={`Remove ${student.name}`}
                  aria-label={`Unenroll ${student.name} from ${course.title}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="no-students">No students enrolled yet</p>
        )}
      </div>

      <div className="course-card-actions">
        <select
          className="enroll-select"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          aria-label={`Select student to enroll in ${course.title}`}
        >
          <option value="">Select student...</option>
          {availableStudents.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleEnroll}
          disabled={!selectedStudent}
          aria-label={selectedStudent ? `Enroll selected student in ${course.title}` : 'Select a student first'}
        >
          Enroll
        </button>
      </div>
    </article>
  );
}

// --- Enrollment Filter ---

function EnrollmentFilter({ value, onChange }) {
  return (
    <div className="enrollment-filter">
      <label className="enrollment-filter-label" htmlFor="enrollment-filter">
        Filter by Enrollments
      </label>
      <select
        id="enrollment-filter"
        className="enrollment-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All Courses</option>
        <option value="none">No enrollments</option>
        <option value="1-10">1 - 10 enrollments</option>
        <option value="11-30">11 - 30 enrollments</option>
        <option value="30+">Over 30 enrollments</option>
      </select>
    </div>
  );
}


// --- Student Detail View ---

function StudentDetail({ student, courses, onBack, onUnenroll }) {
  const enrolledCourses = student.enrolledCourses
    .map((courseId) => courses.find((c) => c.id === courseId))
    .filter(Boolean);

  return (
    <div className="student-detail" aria-label={`Details for ${student.name}`}>
      <div className="detail-header">
        <div
          className="detail-avatar"
          style={{ background: getAvatarColor(student.id) }}
          aria-hidden="true"
        >
          {getInitials(student.name)}
        </div>
        <div className="detail-info">
          <h2>{student.name}</h2>
          <p>{student.email}</p>
          <div className="detail-stats">
            <span className="detail-stat">
              <strong>{enrolledCourses.length}</strong> Courses Enrolled
            </span>
            <span className="detail-stat">
              <strong>
                {enrolledCourses.reduce(
                  (sum, c) => sum + (parseInt(c.duration, 10) || 0),
                  0
                )}
              </strong>{' '}
              Weeks Total
            </span>
          </div>
        </div>
        <button className="btn btn-ghost detail-back" onClick={onBack}>
          ← Back to Courses
        </button>
      </div>

      {enrolledCourses.length > 0 ? (
        <>
          <div className="content-header">
            <h3 className="content-title">Enrolled Courses</h3>
            <p className="content-description">
              Courses {student.name.split(' ')[0]} is currently taking
            </p>
          </div>
          <div className="enrolled-courses-grid" role="list" aria-label="Enrolled courses">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="enrolled-course-card"
                role="listitem"
              >
                <div className="enrolled-course-info">
                  <h4>{course.title}</h4>
                  <p>
                    {course.duration} · {course.level}
                  </p>
                  <button
                    className="btn btn-danger btn-sm enrolled-course-unenroll"
                    onClick={() => onUnenroll(student.id, course.id)}
                    aria-label={`Unenroll from ${course.title}`}
                  >
                    Unenroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state" role="status">
          <div className="empty-state-icon" aria-hidden="true">📚</div>
          <h3 className="empty-state-title">No courses yet</h3>
          <p className="empty-state-description">
            This student hasn't been enrolled in any courses. Go to the courses
            view to enroll them.
          </p>
        </div>
      )}
    </div>
  );
}

// --- Main App Component ---

function App() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [enrollmentFilter, setEnrollmentFilter] = useState('all');

  // Load students & courses from the API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [studentsData, coursesData] = await Promise.all([
        api.fetchStudents(),
        api.fetchCourses(),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err) {
      setLoadError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toast helper with exit animation
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      // Start exit animation
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      // Remove after animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 2700);
  }, []);

  // Existing emails for duplicate checking
  const existingEmails = useMemo(
    () => students.map((s) => s.email.toLowerCase()),
    [students]
  );

  // Add student
  const handleAddStudent = useCallback(
    async (studentData) => {
      try {
        const created = await api.createStudent(studentData);
        setStudents((prev) => [...prev, created]);
        showToast(`${created.name} added successfully!`);
        return true;
      } catch (err) {
        showToast(err.message, 'error');
        return false;
      }
    },
    [showToast]
  );

  // Delete student
  const handleDeleteStudent = useCallback(
    async (studentId) => {
      const student = students.find((s) => s.id === studentId);
      try {
        await api.deleteStudent(studentId);
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        if (selectedStudentId === studentId) {
          setSelectedStudentId(null);
        }
        showToast(`${student?.name} removed`, 'info');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setConfirmDelete(null);
      }
    },
    [students, selectedStudentId, showToast]
  );

  // Enroll student in course
  const handleEnroll = useCallback(
    async (studentId, courseId) => {
      const sid = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
      const course = courses.find((c) => c.id === courseId);
      try {
        const updated = await api.enrollStudent(sid, courseId);
        setStudents((prev) => prev.map((s) => (s.id === sid ? updated : s)));
        showToast(`${updated.name} enrolled in ${course?.title ?? courseId}`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
    [courses, showToast]
  );

  // Unenroll student from course
  const handleUnenroll = useCallback(
    async (studentId, courseId) => {
      const course = courses.find((c) => c.id === courseId);
      try {
        const updated = await api.unenrollStudent(studentId, courseId);
        setStudents((prev) => prev.map((s) => (s.id === studentId ? updated : s)));
        showToast(`${updated.name} unenrolled from ${course?.title ?? courseId}`, 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
    [courses, showToast]
  );

  // Filter courses by active tab and enrollment count
  const filteredCourses = useMemo(() => {
    let result = activeTab === 'all' ? courses : courses.filter((c) => c.category === activeTab);

    if (enrollmentFilter !== 'all') {
      result = result.filter((course) => {
        const count = students.filter((s) =>
          s.enrolledCourses.includes(course.id)
        ).length;
        switch (enrollmentFilter) {
          case 'none': return count === 0;
          case '1-10': return count >= 1 && count <= 10;
          case '11-30': return count >= 11 && count <= 30;
          case '30+': return count > 30;
          default: return true;
        }
      });
    }

    return result;
  }, [activeTab, enrollmentFilter, students, courses]);

  // Filter students by search (sanitize search query)
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = sanitizeInput(searchQuery).toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Enrollment count
  const totalEnrollments = useMemo(() => {
    return students.reduce((sum, s) => sum + s.enrolledCourses.length, 0);
  }, [students]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  if (isLoading) {
    return (
      <div className="app">
        <div className="empty-state" role="status" style={{ margin: '80px auto' }}>
          <h3 className="empty-state-title">Loading…</h3>
          <p className="empty-state-description">Fetching students and courses from the server.</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app">
        <div className="empty-state" role="alert" style={{ margin: '80px auto' }}>
          <h3 className="empty-state-title">Couldn't load data</h3>
          <p className="empty-state-description">{loadError}</p>
          <button className="btn btn-primary" onClick={loadData} style={{ marginTop: '12px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header
        studentCount={students.length}
        courseCount={courses.length}
        enrollmentCount={totalEnrollments}
      />

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar" aria-label="Student management panel">
          <AddStudentForm onAdd={handleAddStudent} existingEmails={existingEmails} />

          <div className="sidebar-section">
            <div className="sidebar-section-title" id="students-list-label">Students</div>
            <div className="search-wrapper">
              <input
                className="search-input"
                type="search"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="student-search"
                aria-label="Search students by name or email"
              />
            </div>
            <div
              className="student-list"
              role="listbox"
              aria-labelledby="students-list-label"
              aria-activedescendant={selectedStudentId ? `student-${selectedStudentId}` : undefined}
              tabIndex={0}
            >
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    isActive={selectedStudentId === student.id}
                    onClick={() =>
                      setSelectedStudentId(
                        selectedStudentId === student.id ? null : student.id
                      )
                    }
                    onDelete={(id) => setConfirmDelete(id)}
                  />
                ))
              ) : (
                <div className="empty-state" style={{ padding: '30px 10px' }} role="status">
                  <div className="empty-state-icon" style={{ fontSize: '32px' }} aria-hidden="true">
                    👤
                  </div>
                  <h3
                    className="empty-state-title"
                    style={{ fontSize: '14px' }}
                  >
                    No students found
                  </h3>
                  <p
                    className="empty-state-description"
                    style={{ fontSize: '12px' }}
                  >
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Add your first student above'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="content-area" id="main-content" aria-label="Main content">
          {selectedStudent ? (
            <StudentDetail
              student={selectedStudent}
              courses={courses}
              onBack={() => setSelectedStudentId(null)}
              onUnenroll={handleUnenroll}
            />
          ) : (
            <>
              <div className="content-header">
                <h1 className="content-title">Course Catalog</h1>
                <p className="content-description">
                  Browse courses and manage student enrollments
                </p>
              </div>

              <div className="tabs-and-filter">
                <nav aria-label="Course categories">
                  <div className="tabs" role="tablist">
                    {[
                      { key: 'all', label: 'All Courses' },
                      { key: 'tech', label: 'Tech' },
                      { key: 'data', label: 'Data' },
                      { key: 'creative', label: 'Creative' },
                      { key: 'business', label: 'Business' },
                      { key: 'science', label: 'Science' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        aria-controls="course-panel"
                        id={`tab-${tab.key}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </nav>
                <EnrollmentFilter
                  value={enrollmentFilter}
                  onChange={setEnrollmentFilter}
                />
              </div>

              <div id="course-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
                {filteredCourses.length > 0 ? (
                  <div className="course-grid">
                    {filteredCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        students={students}
                        onEnroll={handleEnroll}
                        onUnenroll={handleUnenroll}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" role="status">
                    <h3 className="empty-state-title">No courses match this filter</h3>
                    <p className="empty-state-description">
                      Try selecting a different enrollment range or category.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Toasts */}
      <Toast toasts={toasts} />

      {/* Delete Confirmation Modal */}
      {confirmDelete !== null && (
        <ConfirmModal
          title="Delete Student"
          description={`Are you sure you want to remove ${students.find((s) => s.id === confirmDelete)?.name
            }? This will unenroll them from all courses.`}
          onConfirm={() => handleDeleteStudent(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

export default App;
