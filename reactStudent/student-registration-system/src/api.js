const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // response body wasn't JSON; fall back to the generic message
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function fetchStudents() {
  return request('/students');
}

export function fetchCourses() {
  return request('/courses');
}

export function createStudent({ name, email }) {
  return request('/students', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
}

export function deleteStudent(studentId) {
  return request(`/students/${studentId}`, { method: 'DELETE' });
}

export function enrollStudent(studentId, courseId) {
  return request('/enrollments', {
    method: 'POST',
    body: JSON.stringify({ studentId: Number(studentId), courseId }),
  });
}

export function unenrollStudent(studentId, courseId) {
  return request(`/enrollments/${studentId}/${courseId}`, { method: 'DELETE' });
}
