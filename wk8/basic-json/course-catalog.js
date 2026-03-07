// ============================================================
// ICS 385 - Week 8 Basic Assignment
// UH Maui College Course Catalog System
// course-catalog.js - Core Application Logic
// ============================================================

class CourseCatalogManager {
  constructor() {
    this.courseCatalog = null;       // Full parsed JSON data
    this.filteredCourses = [];       // Currently displayed courses
    this.currentView = 'all';
    this.currentSearchQuery = '';    // Tracks the active search term
    this.searchCache = new Map();    // Cache search results for performance
    this.initializeApp();
  }

  // ── Initialization ──────────────────────────────────────────

  initializeApp() {
    try {
      this.setupEventListeners();
      this.loadSampleData();       // Auto-load sample data on start
      this.displayStatistics();
    } catch (error) {
      this.handleError('Application initialization failed', error);
    }
  }

  setupEventListeners() {
    // Search input – live search as user types
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchCourses(e.target.value);
      });
    }

    // Clear search button
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        this.searchCourses('');
      });
    }

    // Department filter dropdown
    const deptFilter = document.getElementById('departmentFilter');
    if (deptFilter) {
      deptFilter.addEventListener('change', () => this.applyFilters());
    }

    // Credits filter dropdown
    const creditsFilter = document.getElementById('creditsFilter');
    if (creditsFilter) {
      creditsFilter.addEventListener('change', () => this.applyFilters());
    }

    // Load sample data button
    const loadBtn = document.getElementById('loadSampleBtn');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.loadSampleData());
    }

    // Add new course button
    const addBtn = document.getElementById('addCourseBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddCourseForm());
    }

    // Export JSON button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportToJSON());
    }

    // Modal close button
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Close modal when clicking outside
    const modal = document.getElementById('courseModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  // ── JSON Loading & Parsing ──────────────────────────────────

  async loadCourseData(jsonString) {
    try {
      // Validate input type
      if (!jsonString || typeof jsonString !== 'string') {
        throw new Error('Invalid input: JSON string required');
      }

      // Parse JSON with error handling
      const data = JSON.parse(jsonString);

      // Validate required catalog structure
      this.validateCatalogStructure(data);

      // Store data and refresh display
      this.courseCatalog = data;
      this.filteredCourses = this.getAllCourses();
      this.populateDepartmentFilter();
      this.displayAllCourses();
      this.displayStatistics();

      console.log('Course catalog loaded successfully');
      this.showSuccessMessage('Course catalog loaded with ' + this.filteredCourses.length + ' courses');

    } catch (error) {
      console.error('JSON parsing error:', error);
      this.handleError('Failed to load course data', error);
    }
  }

  // Load the bundled sample-data.json file
  loadSampleData() {
    // Inline sample data so the page works without a server
    const sampleJSON = JSON.stringify(SAMPLE_DATA);
    this.loadCourseData(sampleJSON);
  }

  // ── Validation ───────────────────────────────────────────────

  validateCatalogStructure(data) {
    const required = ['university', 'semester', 'departments', 'metadata'];
    const missing = required.filter(field => !data.hasOwnProperty(field));

    if (missing.length > 0) {
      throw new Error('Missing required fields: ' + missing.join(', '));
    }

    if (!Array.isArray(data.departments) || data.departments.length === 0) {
      throw new Error('Departments array is required and must contain at least one department');
    }

    data.departments.forEach((dept, index) => {
      if (!dept.code || !dept.name || !Array.isArray(dept.courses)) {
        throw new Error('Department ' + index + ' missing required fields (code, name, courses)');
      }
    });
  }

  validateCourseData(course) {
    const errors = [];

    // Required string fields
    ['courseCode', 'title', 'description'].forEach(field => {
      if (!course[field] || typeof course[field] !== 'string' || course[field].trim().length === 0) {
        errors.push('Missing or invalid: ' + field);
      }
    });

    // Credits must be integer 1-6
    if (!course.credits || !Number.isInteger(course.credits) || course.credits < 1 || course.credits > 6) {
      errors.push('Credits must be an integer between 1 and 6');
    }

    // Instructor validation
    if (!course.instructor || typeof course.instructor !== 'object') {
      errors.push('Instructor information is required');
    } else {
      if (!course.instructor.name || !course.instructor.email) {
        errors.push('Instructor name and email are required');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (course.instructor.email && !emailRegex.test(course.instructor.email)) {
        errors.push('Invalid instructor email format');
      }
    }

    // Schedule validation
    if (!course.schedule || typeof course.schedule !== 'object') {
      errors.push('Schedule information is required');
    } else {
      if (!Array.isArray(course.schedule.days) || course.schedule.days.length === 0) {
        errors.push('Schedule days must be a non-empty array');
      }
      if (typeof course.schedule.capacity !== 'number' || course.schedule.capacity < 1) {
        errors.push('Schedule capacity must be a positive number');
      }
      if (typeof course.schedule.enrolled !== 'number' || course.schedule.enrolled < 0) {
        errors.push('Enrolled must be a non-negative number');
      }
      if (course.schedule.enrolled > course.schedule.capacity) {
        errors.push('Enrolled students cannot exceed capacity');
      }
    }

    // Topics array
    if (!Array.isArray(course.topics) || course.topics.length === 0) {
      errors.push('At least one topic is required');
    }

    return { isValid: errors.length === 0, errors };
  }

  // ── Data Helpers ─────────────────────────────────────────────

  getAllCourses() {
    if (!this.courseCatalog) return [];
    const allCourses = [];
    this.courseCatalog.departments.forEach(dept => {
      dept.courses.forEach(course => {
        allCourses.push({
          ...course,
          departmentCode: dept.code,
          departmentName: dept.name
        });
      });
    });
    return allCourses;
  }

  // ── Search & Filter ──────────────────────────────────────────

  searchCourses(query) {
    // Store the current search query so applyFilters() can use it
    this.currentSearchQuery = (query || '').trim();

    if (!this.currentSearchQuery) {
      // No query — reset filtered list to everything, then re-apply dropdowns
      this.filteredCourses = this.getAllCourses();
      this.applyFilters();
      return;
    }

    const searchTerm = this.currentSearchQuery.toLowerCase();

    // Return cached result if available (performance optimisation)
    if (this.searchCache.has(searchTerm)) {
      this.filteredCourses = this.searchCache.get(searchTerm);
      this.applyFilters();
      return;
    }

    // Multi-field search across code, title, description, instructor, topics, dept
    const results = this.getAllCourses().filter(course => {
      return (
        course.courseCode.toLowerCase().includes(searchTerm) ||
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.instructor.name.toLowerCase().includes(searchTerm) ||
        course.topics.some(t => t.toLowerCase().includes(searchTerm)) ||
        course.departmentName.toLowerCase().includes(searchTerm)
      );
    });

    // Cache results for repeat queries
    this.searchCache.set(searchTerm, results);
    this.filteredCourses = results;
    this.applyFilters();
    this.updateSearchStats(searchTerm, results.length);
  }

  applyFilters() {
    const deptValue = document.getElementById('departmentFilter')?.value || 'all';
    const creditsValue = document.getElementById('creditsFilter')?.value || 'all';

    // Always start from the current search results
    // (this.filteredCourses is kept in sync by searchCourses())
    let result = [...this.filteredCourses];

    // Apply department filter on top of search results
    if (deptValue !== 'all') {
      result = result.filter(c => c.departmentCode === deptValue);
    }

    // Apply credits filter on top
    if (creditsValue !== 'all') {
      const credits = parseInt(creditsValue);
      if (creditsValue === '4') {
        result = result.filter(c => c.credits >= 4);
      } else {
        result = result.filter(c => c.credits === credits);
      }
    }

    this.displayCourses(result);
  }

  filterByDepartment(deptCode) {
    if (!deptCode || deptCode === 'all') {
      return this.getAllCourses();
    }
    return this.getAllCourses().filter(c => c.departmentCode === deptCode);
  }

  filterByCredits(credits) {
    if (!credits || credits === 'all') return this.getAllCourses();
    return this.getAllCourses().filter(c => c.credits === parseInt(credits));
  }

  // ── Display ──────────────────────────────────────────────────

  displayAllCourses() {
    this.displayCourses(this.filteredCourses);
  }

  displayCourses(courses) {
    const container = document.getElementById('coursesContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!courses || courses.length === 0) {
      container.innerHTML = '<div class="no-results">No courses found matching your criteria.</div>';
      this.updateDisplayCount(0);
      return;
    }

    courses.forEach(course => {
      const card = this.createCourseCard(course);
      container.appendChild(card);
    });

    this.updateDisplayCount(courses.length);
  }

  createCourseCard(course) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'course-card';
    cardDiv.dataset.courseCode = course.courseCode;

    const enrollmentPercent = Math.round((course.schedule.enrolled / course.schedule.capacity) * 100);
    const enrollmentStatus = enrollmentPercent >= 90 ? 'full' : enrollmentPercent >= 70 ? 'filling' : 'open';
    const statusLabel = enrollmentPercent >= 90 ? 'Full' : enrollmentPercent >= 70 ? 'Filling Up' : 'Open';

    cardDiv.innerHTML = `
      <div class="course-header">
        <div class="course-code-block">
          <span class="course-code">${course.courseCode}</span>
          <span class="dept-badge">${course.departmentCode}</span>
        </div>
        <span class="credits-badge">${course.credits} cr</span>
      </div>
      <h3 class="course-title">${course.title}</h3>
      <p class="course-description">${this.truncateText(course.description, 110)}</p>
      <div class="course-meta">
        <div class="meta-row">
          <span class="meta-icon">👤</span>
          <span>${course.instructor.name}</span>
        </div>
        <div class="meta-row">
          <span class="meta-icon">📅</span>
          <span>${course.schedule.days.join(', ')} · ${course.schedule.time}</span>
        </div>
        <div class="meta-row">
          <span class="meta-icon">📍</span>
          <span>${course.schedule.location}</span>
        </div>
      </div>
      <div class="enrollment-bar-wrap">
        <div class="enrollment-label">
          <span>Enrollment</span>
          <span class="enrollment-status ${enrollmentStatus}">${statusLabel}</span>
        </div>
        <div class="enrollment-bar">
          <div class="enrollment-fill ${enrollmentStatus}" style="width:${enrollmentPercent}%"></div>
        </div>
        <div class="enrollment-numbers">${course.schedule.enrolled} / ${course.schedule.capacity} students (${enrollmentPercent}%)</div>
      </div>
      <div class="topics-wrap">
        ${course.topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}
      </div>
      <button class="details-btn" onclick="app.showCourseDetails('${course.courseCode}')">
        View Full Details
      </button>
    `;

    return cardDiv;
  }

  showCourseDetails(courseCode) {
    const course = this.getAllCourses().find(c => c.courseCode === courseCode);
    if (!course) return;

    const enrollmentPercent = Math.round((course.schedule.enrolled / course.schedule.capacity) * 100);
    const prereqs = course.prerequisites.length > 0 ? course.prerequisites.join(', ') : 'None';

    const assignmentsHTML = course.assignments.map(a => `
      <tr>
        <td>${a.name}</td>
        <td>${a.points} pts</td>
        <td>${a.dueDate}</td>
      </tr>
    `).join('');

    document.getElementById('modalBody').innerHTML = `
      <div class="modal-header">
        <div>
          <span class="modal-course-code">${course.courseCode}</span>
          <span class="modal-dept">${course.departmentName}</span>
        </div>
        <span class="modal-credits">${course.credits} Credits</span>
      </div>
      <h2 class="modal-title">${course.title}</h2>
      <p class="modal-description">${course.description}</p>

      <div class="modal-grid">
        <div class="modal-section">
          <h4>Instructor</h4>
          <p><strong>${course.instructor.name}</strong></p>
          <p>📧 <a href="mailto:${course.instructor.email}">${course.instructor.email}</a></p>
          <p>🏢 ${course.instructor.office}</p>
        </div>
        <div class="modal-section">
          <h4>Schedule</h4>
          <p>📅 ${course.schedule.days.join(', ')}</p>
          <p>🕐 ${course.schedule.time}</p>
          <p>📍 ${course.schedule.location}</p>
        </div>
        <div class="modal-section">
          <h4>Enrollment</h4>
          <p>${course.schedule.enrolled} / ${course.schedule.capacity} (${enrollmentPercent}%)</p>
          <div class="enrollment-bar">
            <div class="enrollment-fill ${enrollmentPercent >= 90 ? 'full' : enrollmentPercent >= 70 ? 'filling' : 'open'}" style="width:${enrollmentPercent}%"></div>
          </div>
        </div>
        <div class="modal-section">
          <h4>Prerequisites</h4>
          <p>${prereqs}</p>
        </div>
      </div>

      <div class="modal-section full-width">
        <h4>Course Topics</h4>
        <div class="topics-wrap">
          ${course.topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}
        </div>
      </div>

      <div class="modal-section full-width">
        <h4>Assignments</h4>
        <table class="assignments-table">
          <thead><tr><th>Assignment</th><th>Points</th><th>Due Date</th></tr></thead>
          <tbody>${assignmentsHTML}</tbody>
        </table>
      </div>

      <div class="modal-json-section">
        <h4>Raw JSON Data</h4>
        <pre class="json-preview">${JSON.stringify(course, null, 2)}</pre>
      </div>
    `;

    document.getElementById('courseModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    document.getElementById('courseModal').classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ── Statistics ───────────────────────────────────────────────

  displayStatistics() {
    if (!this.courseCatalog) return;

    const allCourses = this.getAllCourses();
    const totalEnrolled = allCourses.reduce((sum, c) => sum + c.schedule.enrolled, 0);
    const totalCapacity = allCourses.reduce((sum, c) => sum + c.schedule.capacity, 0);
    const avgEnrollment = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('totalCourses', allCourses.length);
    el('totalDepartments', this.courseCatalog.departments.length);
    el('averageEnrollment', avgEnrollment + '%');
  }

  calculateEnrollmentStats() {
    const courses = this.getAllCourses();
    return courses.map(c => ({
      courseCode: c.courseCode,
      enrolled: c.schedule.enrolled,
      capacity: c.schedule.capacity,
      percent: Math.round((c.schedule.enrolled / c.schedule.capacity) * 100)
    }));
  }

  // ── Add New Course ───────────────────────────────────────────

  showAddCourseForm() {
    if (!this.courseCatalog) {
      this.showErrorMessage('Please load course data first before adding a course.');
      return;
    }

    const deptOptions = this.courseCatalog.departments
      .map(d => `<option value="${d.code}">${d.name} (${d.code})</option>`)
      .join('');

    document.getElementById('modalBody').innerHTML = `
      <h2 class="modal-title">Add New Course</h2>
      <div class="add-form">
        <div class="form-group">
          <label for="f-dept">Department *</label>
          <select id="f-dept">${deptOptions}</select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="f-code">Course Code *</label>
            <input id="f-code" type="text" placeholder="e.g. ICS 400">
          </div>
          <div class="form-group">
            <label for="f-credits">Credits (1-6) *</label>
            <input id="f-credits" type="number" min="1" max="6" placeholder="3">
          </div>
        </div>
        <div class="form-group">
          <label for="f-title">Course Title *</label>
          <input id="f-title" type="text" placeholder="e.g. Advanced Web Development">
        </div>
        <div class="form-group">
          <label for="f-desc">Description *</label>
          <textarea id="f-desc" rows="3" placeholder="Course description..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="f-iname">Instructor Name *</label>
            <input id="f-iname" type="text" placeholder="Prof. Jane Doe">
          </div>
          <div class="form-group">
            <label for="f-iemail">Instructor Email *</label>
            <input id="f-iemail" type="email" placeholder="jdoe@hawaii.edu">
          </div>
        </div>
        <div class="form-group">
          <label for="f-ioffice">Office Location</label>
          <input id="f-ioffice" type="text" placeholder="Building Room">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="f-capacity">Capacity *</label>
            <input id="f-capacity" type="number" min="1" placeholder="30">
          </div>
          <div class="form-group">
            <label for="f-enrolled">Currently Enrolled *</label>
            <input id="f-enrolled" type="number" min="0" placeholder="0">
          </div>
        </div>
        <div class="form-group">
          <label for="f-topics">Topics (comma-separated) *</label>
          <input id="f-topics" type="text" placeholder="HTML, CSS, JavaScript">
        </div>
        <div id="form-errors" class="form-errors hidden"></div>
        <div class="form-actions">
          <button class="btn-cancel" onclick="app.closeModal()">Cancel</button>
          <button class="btn-submit" onclick="app.submitNewCourse()">Add Course</button>
        </div>
      </div>
    `;

    document.getElementById('courseModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  submitNewCourse() {
    const get = (id) => document.getElementById(id)?.value.trim() || '';

    const newCourse = {
      courseCode: get('f-code'),
      title: get('f-title'),
      credits: parseInt(get('f-credits')) || 0,
      description: get('f-desc'),
      prerequisites: [],
      instructor: {
        name: get('f-iname'),
        email: get('f-iemail'),
        office: get('f-ioffice') || 'TBD'
      },
      schedule: {
        days: ['TBD'],
        time: 'TBD',
        location: 'TBD',
        capacity: parseInt(get('f-capacity')) || 0,
        enrolled: parseInt(get('f-enrolled')) || 0
      },
      isActive: true,
      topics: get('f-topics').split(',').map(t => t.trim()).filter(Boolean),
      assignments: []
    };

    const validation = this.validateCourseData(newCourse);

    if (!validation.isValid) {
      const errDiv = document.getElementById('form-errors');
      errDiv.innerHTML = '<strong>Please fix the following:</strong><ul>' +
        validation.errors.map(e => `<li>${e}</li>`).join('') + '</ul>';
      errDiv.classList.remove('hidden');
      return;
    }

    // Add to catalog
    const deptCode = get('f-dept');
    const dept = this.courseCatalog.departments.find(d => d.code === deptCode);
    if (dept) {
      dept.courses.push(newCourse);
      this.courseCatalog.metadata.totalCourses++;
      this.filteredCourses = this.getAllCourses();
      this.searchCache.clear(); // Clear cache after mutation
      this.displayAllCourses();
      this.displayStatistics();
      this.closeModal();
      this.showSuccessMessage('Course ' + newCourse.courseCode + ' added successfully!');
    }
  }

  // ── Export ───────────────────────────────────────────────────

  exportToJSON() {
    if (!this.courseCatalog) {
      this.showErrorMessage('No catalog data to export. Please load data first.');
      return;
    }

    try {
      const jsonString = JSON.stringify(this.courseCatalog, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'course-catalog-' + new Date().toISOString().split('T')[0] + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showSuccessMessage('Catalog exported as JSON successfully!');
    } catch (error) {
      this.handleError('Export failed', error);
    }
  }

  // ── Utility ──────────────────────────────────────────────────

  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '…';
  }

  populateDepartmentFilter() {
    const select = document.getElementById('departmentFilter');
    if (!select || !this.courseCatalog) return;

    // Clear existing options except "All"
    while (select.options.length > 1) select.remove(1);

    this.courseCatalog.departments.forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept.code;
      opt.textContent = dept.name + ' (' + dept.code + ')';
      select.appendChild(opt);
    });
  }

  updateSearchStats(term, count) {
    const container = document.getElementById('searchStats');
    if (container) {
      container.textContent = count > 0
        ? `Found ${count} course${count !== 1 ? 's' : ''} for "${term}"`
        : `No courses found for "${term}"`;
    }
  }

  updateDisplayCount(count) {
    const el = document.getElementById('displayCount');
    if (el) el.textContent = 'Showing ' + count + ' course' + (count !== 1 ? 's' : '');
  }

  showSuccessMessage(msg) {
    this.showToast(msg, 'success');
  }

  showErrorMessage(msg) {
    this.showToast(msg, 'error');
  }

  showToast(msg, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = msg;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('toast-visible'), 10);
    // Auto-remove after 3.5s
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  handleError(operation, error) {
    let userMessage = 'An error occurred';

    if (error instanceof SyntaxError) {
      userMessage = 'Invalid JSON format — please check your data structure';
    } else if (error.message.includes('Missing required fields')) {
      userMessage = 'Validation failed: ' + error.message;
    } else if (error.message.includes('network')) {
      userMessage = 'Network error — please check your connection';
    } else {
      userMessage = operation + ': ' + error.message;
    }

    // Detailed log for debugging
    console.error('JSON Operation Error:', {
      operation,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    this.showErrorMessage(userMessage);
  }
}

// ── Inline Sample Data ────────────────────────────────────────
// This mirrors sample-data.json so the page works without a server.
const SAMPLE_DATA = {
  "university": "University of Hawaii Maui College",
  "semester": "Spring 2026",
  "lastUpdated": "2026-03-03",
  "departments": [
    {
      "code": "ICS",
      "name": "Information and Computer Sciences",
      "chair": "Dr. Jane Smith",
      "courses": [
        {
          "courseCode": "ICS 385",
          "title": "Web Development and Administration",
          "credits": 3,
          "description": "Detailed knowledge of web page authoring and server-side programming including HTML, CSS, JavaScript, and modern frameworks.",
          "prerequisites": ["ICS 320"],
          "instructor": { "name": "Dr. Debasis Bhattacharya", "email": "debasisb@hawaii.edu", "office": "Kaaike 114" },
          "schedule": { "days": ["Tuesday"], "time": "4:30 PM - 5:45 PM", "location": "Online (Zoom)", "capacity": 25, "enrolled": 18 },
          "isActive": true,
          "topics": ["HTML", "CSS", "JavaScript", "Node.js", "APIs", "React"],
          "assignments": [
            { "name": "Week 1 - Setup", "points": 1, "dueDate": "2026-01-19" },
            { "name": "Week 2 - HTML/CSS", "points": 3, "dueDate": "2026-01-26" },
            { "name": "Week 8 - JSON", "points": 1, "dueDate": "2026-03-06" }
          ]
        },
        {
          "courseCode": "ICS 320",
          "title": "Intermediate Web Development",
          "credits": 3,
          "description": "Intermediate web development topics including responsive design, JavaScript DOM manipulation, and introduction to backend development.",
          "prerequisites": ["ICS 215"],
          "instructor": { "name": "Prof. Lisa Nakamura", "email": "lisanaka@hawaii.edu", "office": "Kaaike 110" },
          "schedule": { "days": ["Monday", "Wednesday"], "time": "1:00 PM - 2:15 PM", "location": "Ka Lama 102", "capacity": 28, "enrolled": 22 },
          "isActive": true,
          "topics": ["Responsive Design", "DOM", "jQuery", "REST APIs", "Bootstrap"],
          "assignments": [
            { "name": "Project 1 - Portfolio", "points": 20, "dueDate": "2026-02-10" },
            { "name": "Midterm Project", "points": 50, "dueDate": "2026-03-20" }
          ]
        },
        {
          "courseCode": "ICS 215",
          "title": "Introduction to Scripting",
          "credits": 3,
          "description": "Introduction to scripting languages with emphasis on Python and JavaScript for automating tasks and building simple applications.",
          "prerequisites": [],
          "instructor": { "name": "Prof. Kevin Tanaka", "email": "ktanaka@hawaii.edu", "office": "Kaaike 108" },
          "schedule": { "days": ["Tuesday", "Thursday"], "time": "9:00 AM - 10:15 AM", "location": "Ka Lama 105", "capacity": 30, "enrolled": 30 },
          "isActive": true,
          "topics": ["Python", "JavaScript", "Automation", "File I/O", "Functions"],
          "assignments": [
            { "name": "Lab 1 - Hello World", "points": 5, "dueDate": "2026-01-22" },
            { "name": "Lab 2 - Functions", "points": 10, "dueDate": "2026-02-05" }
          ]
        }
      ]
    },
    {
      "code": "MATH",
      "name": "Mathematics",
      "chair": "Dr. Robert Johnson",
      "courses": [
        {
          "courseCode": "MATH 140",
          "title": "Calculus I",
          "credits": 4,
          "description": "Limits, derivatives, and applications of derivatives. Introduction to integration and the Fundamental Theorem of Calculus.",
          "prerequisites": ["MATH 135"],
          "instructor": { "name": "Dr. Sarah Wilson", "email": "sarahw@hawaii.edu", "office": "Academic Center 201" },
          "schedule": { "days": ["Monday", "Wednesday", "Friday"], "time": "10:00 AM - 10:50 AM", "location": "AC 105", "capacity": 30, "enrolled": 25 },
          "isActive": true,
          "topics": ["Limits", "Derivatives", "Integration", "Applications", "Chain Rule"],
          "assignments": [
            { "name": "Homework 1", "points": 10, "dueDate": "2026-01-20" },
            { "name": "Midterm Exam", "points": 100, "dueDate": "2026-03-15" }
          ]
        },
        {
          "courseCode": "MATH 135",
          "title": "Pre-Calculus",
          "credits": 3,
          "description": "Functions, polynomial and rational functions, exponential and logarithmic functions, trigonometry, and conic sections.",
          "prerequisites": ["MATH 100"],
          "instructor": { "name": "Prof. Michael Reyes", "email": "mreyes@hawaii.edu", "office": "Academic Center 205" },
          "schedule": { "days": ["Monday", "Wednesday", "Friday"], "time": "8:00 AM - 8:50 AM", "location": "AC 110", "capacity": 32, "enrolled": 28 },
          "isActive": true,
          "topics": ["Functions", "Trigonometry", "Polynomials", "Logarithms", "Conics"],
          "assignments": [
            { "name": "Quiz 1", "points": 20, "dueDate": "2026-01-28" },
            { "name": "Chapter Test 1", "points": 50, "dueDate": "2026-02-18" }
          ]
        },
        {
          "courseCode": "MATH 205",
          "title": "Statistics",
          "credits": 3,
          "description": "Descriptive statistics, probability, sampling distributions, confidence intervals, hypothesis testing, and regression analysis.",
          "prerequisites": ["MATH 100"],
          "instructor": { "name": "Dr. Angela Fong", "email": "afong@hawaii.edu", "office": "Academic Center 212" },
          "schedule": { "days": ["Tuesday", "Thursday"], "time": "11:00 AM - 12:15 PM", "location": "AC 108", "capacity": 35, "enrolled": 20 },
          "isActive": true,
          "topics": ["Descriptive Stats", "Probability", "Hypothesis Testing", "Regression", "ANOVA"],
          "assignments": [
            { "name": "Lab 1 - Data Collection", "points": 15, "dueDate": "2026-01-30" },
            { "name": "Midterm Project", "points": 75, "dueDate": "2026-03-12" }
          ]
        }
      ]
    },
    {
      "code": "ENG",
      "name": "English",
      "chair": "Dr. Patricia Kahananui",
      "courses": [
        {
          "courseCode": "ENG 100",
          "title": "Composition I",
          "credits": 3,
          "description": "Introduction to college writing. Focus on expository and argumentative writing, critical reading, and research skills.",
          "prerequisites": [],
          "instructor": { "name": "Prof. James Holbrook", "email": "jholbrook@hawaii.edu", "office": "Laulima 201" },
          "schedule": { "days": ["Monday", "Wednesday", "Friday"], "time": "11:00 AM - 11:50 AM", "location": "Laulima 105", "capacity": 25, "enrolled": 24 },
          "isActive": true,
          "topics": ["Essay Writing", "Research", "Citation", "Argumentation", "Revision"],
          "assignments": [
            { "name": "Essay 1 - Narrative", "points": 25, "dueDate": "2026-01-30" },
            { "name": "Essay 2 - Argument", "points": 30, "dueDate": "2026-02-20" }
          ]
        },
        {
          "courseCode": "ENG 200",
          "title": "Composition II",
          "credits": 3,
          "description": "Advanced college writing with emphasis on research-based argumentation, literary analysis, and academic writing conventions.",
          "prerequisites": ["ENG 100"],
          "instructor": { "name": "Dr. Maya Cordeiro", "email": "mcordeiro@hawaii.edu", "office": "Laulima 208" },
          "schedule": { "days": ["Tuesday", "Thursday"], "time": "2:00 PM - 3:15 PM", "location": "Laulima 110", "capacity": 25, "enrolled": 16 },
          "isActive": true,
          "topics": ["Research Writing", "Literary Analysis", "APA Format", "Synthesis", "Peer Review"],
          "assignments": [
            { "name": "Annotated Bibliography", "points": 20, "dueDate": "2026-02-05" },
            { "name": "Research Paper Draft", "points": 40, "dueDate": "2026-03-10" }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "totalCourses": 8,
    "totalDepartments": 3,
    "totalCreditsOffered": 25,
    "academicYear": "2025-2026"
  }
};

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  window.app = new CourseCatalogManager();
});
