/**
 * course-catalog.js - Course Catalog & Management
 * =================================================
 * Handles all local JSON course data operations.
 * Provides CRUD operations, search/filter, and statistics
 * that feed into the main dashboard. This module is self-contained
 * and does not depend on any external APIs.
 *
 * Data source: sample-data.json (loaded via fetch)
 */

class CourseCatalog {
  constructor() {
    this.data = null;       // Raw JSON from sample-data.json
    this.courses = [];      // Flat array of all courses (for easy iteration)
    this.nextId = 1000;     // Auto-increment ID base for new user-added courses
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────

  /**
   * Loads course data from sample-data.json.
   * Flattens nested department/courses structure into a searchable array.
   * @returns {Promise<Object>} The raw catalog data
   */
  async load() {
    try {
      const response = await fetch('./sample-data.json');
      if (!response.ok) throw new Error(`Failed to load course data: ${response.status}`);
      this.data = await response.json();
      this._flattenCourses();
      console.log(`[CourseCatalog] Loaded ${this.courses.length} courses across ${this.data.departments.length} departments.`);
      return this.data;
    } catch (error) {
      console.error('[CourseCatalog] Load error:', error);
      // Provide minimal fallback so dashboard still renders
      this.data = { institution: { name: 'UH Maui College' }, departments: [] };
      this.courses = [];
      throw error;
    }
  }

  /**
   * Flattens the nested department > courses structure.
   * Adds departmentId and departmentName to each course object
   * for easy display and filtering.
   */
  _flattenCourses() {
    this.courses = [];
    (this.data.departments || []).forEach(dept => {
      (dept.courses || []).forEach(course => {
        this.courses.push({
          ...course,
          departmentId:   dept.id,
          departmentName: dept.name
        });
      });
    });
  }

  // ─── Read Operations ──────────────────────────────────────────────────────

  /** Returns all courses as a flat array. */
  getAll() {
    return [...this.courses];
  }

  /** Returns all department objects. */
  getDepartments() {
    return this.data ? [...this.data.departments] : [];
  }

  /**
   * Finds a single course by its ID.
   * @param {string} id - Course ID (e.g. "ICS385")
   * @returns {Object|null}
   */
  getById(id) {
    return this.courses.find(c => c.id === id) || null;
  }

  /**
   * Searches courses by query string against id, title, instructor, and description.
   * Optionally filters by departmentId.
   * @param {string} query
   * @param {string} departmentId - Pass 'all' or '' to skip dept filter
   * @returns {Object[]}
   */
  search(query = '', departmentId = 'all') {
    const q = query.toLowerCase().trim();
    return this.courses.filter(course => {
      const matchesDept = !departmentId || departmentId === 'all'
        ? true
        : course.departmentId === departmentId;

      const matchesQuery = !q
        ? true
        : course.id.toLowerCase().includes(q) ||
          course.title.toLowerCase().includes(q) ||
          course.instructor.toLowerCase().includes(q) ||
          course.description.toLowerCase().includes(q);

      return matchesDept && matchesQuery;
    });
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  /**
   * Calculates aggregate statistics for the dashboard stat cards.
   * @returns {Object} stats
   */
  getStats() {
    const total = this.courses.length;
    const totalEnrolled = this.courses.reduce((sum, c) => sum + (c.enrolled || 0), 0);
    const totalCapacity = this.courses.reduce((sum, c) => sum + (c.capacity || 0), 0);
    const avgCapacityPct = totalCapacity > 0
      ? Math.round((totalEnrolled / totalCapacity) * 100)
      : 0;
    const fullCourses = this.courses.filter(c => c.enrolled >= c.capacity).length;

    return {
      totalCourses:    total,
      totalEnrolled,
      totalCapacity,
      avgCapacityPct,
      fullCourses,
      departments:     this.getDepartments().length
    };
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  /**
   * Adds a new course to the catalog (in-memory only; no server persistence).
   * Finds the matching department or creates one if it doesn't exist.
   * @param {Object} courseData
   * @returns {Object} The newly created course
   */
  addCourse(courseData) {
    const id = courseData.id || `NEW${++this.nextId}`;
    const newCourse = {
      id,
      title:       courseData.title       || 'Untitled Course',
      credits:     parseInt(courseData.credits) || 3,
      instructor:  courseData.instructor  || 'TBA',
      enrolled:    parseInt(courseData.enrolled)  || 0,
      capacity:    parseInt(courseData.capacity)  || 25,
      schedule:    courseData.schedule    || 'TBA',
      room:        courseData.room        || 'TBA',
      description: courseData.description || '',
      departmentId:   courseData.departmentId   || 'ICS',
      departmentName: courseData.departmentName || 'Information & Computer Sciences'
    };

    // Add to flat list
    this.courses.push(newCourse);

    // Also add to the nested data structure so exports are consistent
    const dept = this.data.departments.find(d => d.id === newCourse.departmentId);
    if (dept) {
      dept.courses.push(newCourse);
    } else {
      // Create new department entry if needed
      this.data.departments.push({
        id:      newCourse.departmentId,
        name:    newCourse.departmentName,
        courses: [newCourse]
      });
    }

    console.log(`[CourseCatalog] Added course: ${id}`);
    return newCourse;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  /**
   * Updates an existing course in-place.
   * @param {string} id - Course ID to update
   * @param {Object} updates - Partial course object with fields to change
   * @returns {Object|null} Updated course or null if not found
   */
  updateCourse(id, updates) {
    const idx = this.courses.findIndex(c => c.id === id);
    if (idx === -1) {
      console.warn(`[CourseCatalog] updateCourse: course ${id} not found.`);
      return null;
    }
    this.courses[idx] = { ...this.courses[idx], ...updates };

    // Mirror update in nested structure
    for (const dept of this.data.departments) {
      const ci = dept.courses.findIndex(c => c.id === id);
      if (ci !== -1) { dept.courses[ci] = this.courses[idx]; break; }
    }

    console.log(`[CourseCatalog] Updated course: ${id}`);
    return this.courses[idx];
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  /**
   * Removes a course from the catalog.
   * @param {string} id - Course ID to remove
   * @returns {boolean} True if removed, false if not found
   */
  deleteCourse(id) {
    const idx = this.courses.findIndex(c => c.id === id);
    if (idx === -1) return false;

    this.courses.splice(idx, 1);

    // Mirror deletion in nested structure
    for (const dept of this.data.departments) {
      const ci = dept.courses.findIndex(c => c.id === id);
      if (ci !== -1) { dept.courses.splice(ci, 1); break; }
    }

    console.log(`[CourseCatalog] Deleted course: ${id}`);
    return true;
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  /**
   * Exports the full catalog (including any user-added courses) as a JSON string.
   * @returns {string} Pretty-printed JSON
   */
  exportJson() {
    return JSON.stringify(this.data, null, 2);
  }
}
