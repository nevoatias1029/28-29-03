import React, { useState, useCallback, useMemo } from 'react';
import './App.css';
import { COURSES, AVATAR_COLORS, INITIAL_STUDENTS } from './data';

// Helper Functions

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

function getCourseById(id) {
  return COURSES.find((c) => c.id === id);
}

// Toast Component

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

// Confirm Modal

function ConfirmModal({ title, description, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-description">{description}</p>
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

// ============================================
// Header Component
// ============================================
function Header({ studentCount, courseCount, enrollmentCount }) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">N</div>
        <div>
          <div className="header-title">Course - Student Registration </div>
          <div className="header-subtitle"> Nevo Hub</div>
        </div>
      </div>
      <div className="header-stats">
        <div className="header-stat">
          <span className="header-stat-value">{studentCount}</span>
          <span className="header-stat-label">Students</span>
        </div>
        <div className="header-stat">
          <span className="header-stat-value">{courseCount}</span>
          <span className="header-stat-label">Courses</span>
        </div>
        <div className="header-stat">
          <span className="header-stat-value">{enrollmentCount}</span>
          <span className="header-stat-label">Enrollments</span>
        </div>
      </div>
    </header>
  );
}

// Add Student Form

function AddStudentForm({ onAdd }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onAdd({ name: name.trim(), email: email.trim() });
    setName('');
    setEmail('');
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form-title">
        <span className="add-form-title-icon">+</span>
        Add New Student
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="student-name">Full Name</label>
        <input
          id="student-name"
          className="form-input"
          type="text"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="student-email">Email Address</label>
        <input
          id="student-email"
          className="form-input"
          type="email"
          placeholder="e.g. john@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary btn-full" id="add-student-btn">
        Add Student
      </button>
    </form>
  );
}

// Student Card in Sidebar

function StudentCard({ student, isActive, onClick, onDelete }) {
  return (
    <div
      className={`student-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div
        className="student-avatar"
        style={{ background: getAvatarColor(student.id) }}
      >
        {getInitials(student.name)}
      </div>
      <div className="student-card-info">
        <div className="student-card-name">{student.name}</div>
        <div className="student-card-email">{student.email}</div>
      </div>
      <span className="student-card-badge">
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

// Course Card

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
    <div className="course-card" id={`course-${course.id}`}>
      <div className="course-card-header">
        <div>
          <div className="course-card-title">{course.title}</div>
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
        <span className="course-meta-item">
          {enrolledStudents.length}/{course.maxStudents}
        </span>
      </div>

      <div className="course-card-students">
        <div className="course-students-title">
          Enrolled Students
          <span className="student-count">
            {enrolledStudents.length} enrolled
          </span>
        </div>
        {enrolledStudents.length > 0 ? (
          <div className="enrolled-students">
            {enrolledStudents.map((student) => (
              <span key={student.id} className="enrolled-student-chip">
                <span
                  className="chip-avatar"
                  style={{ background: getAvatarColor(student.id) }}
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
        >
          Enroll
        </button>
      </div>
    </div>
  );
}

// Student Detail View

function StudentDetail({ student, onBack, onUnenroll }) {
  const enrolledCourses = student.enrolledCourses
    .map(getCourseById)
    .filter(Boolean);

  return (
    <div className="student-detail">
      <div className="detail-header">
        <div
          className="detail-avatar"
          style={{ background: getAvatarColor(student.id) }}
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
          <div className="enrolled-courses-grid">
            {enrolledCourses.map((course, index) => (
              <div
                key={course.id}
                className="enrolled-course-card"
              >
                <div className="enrolled-course-info">
                  <h4>{course.title}</h4>
                  <p>
                    {course.duration} · {course.level}
                  </p>
                  <button
                    className="btn btn-danger btn-sm enrolled-course-unenroll"
                    onClick={() => onUnenroll(student.id, course.id)}
                  >
                    Unenroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
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

// Main App Component

function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [nextId, setNextId] = useState(7);

  // Toast helper
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Add student
  const handleAddStudent = useCallback(
    (studentData) => {
      const newStudent = {
        id: nextId,
        name: studentData.name,
        email: studentData.email,
        enrolledCourses: [],
      };
      setStudents((prev) => [...prev, newStudent]);
      setNextId((prev) => prev + 1);
      showToast(`${studentData.name} added successfully!`);
    },
    [nextId, showToast]
  );

  // Delete student
  const handleDeleteStudent = useCallback(
    (studentId) => {
      const student = students.find((s) => s.id === studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      if (selectedStudentId === studentId) {
        setSelectedStudentId(null);
      }
      setConfirmDelete(null);
      showToast(`${student?.name} removed`, 'info');
    },
    [students, selectedStudentId, showToast]
  );

  // Enroll student in course
  const handleEnroll = useCallback(
    (studentId, courseId) => {
      const sid = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
      const student = students.find((s) => s.id === sid);
      const course = getCourseById(courseId);

      if (!student || !course) return;

      if (student.enrolledCourses.includes(courseId)) {
        showToast(`${student.name} is already enrolled in ${course.title}`, 'error');
        return;
      }

      const enrolledCount = students.filter((s) =>
        s.enrolledCourses.includes(courseId)
      ).length;
      if (enrolledCount >= course.maxStudents) {
        showToast(`${course.title} is full (${course.maxStudents} max)`, 'error');
        return;
      }

      setStudents((prev) =>
        prev.map((s) =>
          s.id === sid
            ? { ...s, enrolledCourses: [...s.enrolledCourses, courseId] }
            : s
        )
      );
      showToast(`${student.name} enrolled in ${course.title}`);
    },
    [students, showToast]
  );

  // Unenroll student from course
  const handleUnenroll = useCallback(
    (studentId, courseId) => {
      const student = students.find((s) => s.id === studentId);
      const course = getCourseById(courseId);

      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
              ...s,
              enrolledCourses: s.enrolledCourses.filter(
                (cid) => cid !== courseId
              ),
            }
            : s
        )
      );
      showToast(
        `${student?.name} unenrolled from ${course?.title}`,
        'info'
      );
    },
    [students, showToast]
  );

  // Filter courses by active tab
  const filteredCourses = useMemo(() => {
    if (activeTab === 'all') return COURSES;
    return COURSES.filter((c) => c.category === activeTab);
  }, [activeTab]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
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

  return (
    <div className="app">
      <Header
        studentCount={students.length}
        courseCount={COURSES.length}
        enrollmentCount={totalEnrollments}
      />

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <AddStudentForm onAdd={handleAddStudent} />

          <div className="sidebar-section">
            <div className="sidebar-section-title">Students</div>
            <div className="search-wrapper">
              <input
                className="search-input"
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="student-search"
              />
            </div>
            <div className="student-list">
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
                <div className="empty-state" style={{ padding: '30px 10px' }}>
                  <div className="empty-state-icon" style={{ fontSize: '32px' }}>
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
        <main className="content-area">
          {selectedStudent ? (
            <StudentDetail
              student={selectedStudent}
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

              <div className="tabs" role="tablist">
                {[
                  { key: 'all', label: 'All Courses' },
                  { key: 'tech', label: ' Tech' },
                  { key: 'data', label: ' Data' },
                  { key: 'creative', label: ' Creative' },
                  { key: 'business', label: ' Business' },
                  { key: 'science', label: ' Science' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    id={`tab-${tab.key}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

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
