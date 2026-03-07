# ICS 385 – Week 8 Basic Assignment
## UH Maui College Course Catalog System

**Course:** ICS 385 Web Development and Administration  
**Semester:** Spring 2026  
**Assignment:** Week 8 Basic – JSON Fundamentals (1 point)

---

## Live Demo

> Add your GitHub Pages URL here after deployment:  
> `https://YOUR-USERNAME.github.io/YOUR-REPO/week8/basic-json/`

---

## Project Structure

```
week8/basic-json/
├── index.html          ← Main HTML page
├── styles.css          ← All styling (responsive, accessible)
├── course-catalog.js   ← CourseCatalogManager class + all logic
├── sample-data.json    ← 8 courses across 3 departments
└── README.md           ← This file
```

---

## Features

- **JSON Parsing** – `loadCourseData()` uses `JSON.parse()` with full `try/catch` error handling
- **Data Validation** – `validateCatalogStructure()` and `validateCourseData()` check all required fields, types, and ranges
- **Live Search** – `searchCourses()` searches course code, title, description, instructor name, topics, and department; results are cached in a `Map` for performance
- **Department Filter** – `filterByDepartment()` dynamically populated from loaded JSON
- **Credits Filter** – `filterByCredits()` filters by 1–4+ credit hours
- **Combined Filters** – department and credit filters work together after search
- **Course Cards** – responsive grid with enrollment color-coding (green/yellow/red)
- **Course Detail Modal** – full info including assignments table and raw JSON preview
- **Add New Course** – form with client-side validation; errors shown inline
- **Export JSON** – `exportToJSON()` downloads the current catalog (including any added courses) as a formatted `.json` file
- **Enrollment Stats** – percentage bars and summary statistics strip
- **Toast Notifications** – success and error feedback
- **Accessible** – WCAG 2.1 AA focus indicators, ARIA labels, `aria-live` region

---

## Setup & Running Locally

1. Clone or download the repository
2. Open `week8/basic-json/index.html` directly in a browser  
   *(No server required – sample data is bundled in `course-catalog.js`)*
3. The catalog loads automatically with 8 sample courses

To use the separate `sample-data.json` file with a local server:
```bash
# From the repo root
npx serve .
# Then open http://localhost:3000/week8/basic-json/
```

---

## Deploying to GitHub Pages

1. Push all files to your GitHub repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/` or `/docs`
4. Visit `https://YOUR-USERNAME.github.io/REPO-NAME/week8/basic-json/`

---

## Key JSON Concepts Demonstrated

| Concept | Where Used |
|---|---|
| `JSON.parse()` | `loadCourseData()` in course-catalog.js |
| `JSON.stringify()` | `exportToJSON()` – formatted with 2-space indent |
| Nested objects | Instructor, schedule objects inside each course |
| Arrays | departments[], courses[], topics[], assignments[] |
| Type validation | `validateCourseData()` checks strings, integers, arrays |
| Error handling | `SyntaxError` caught and displayed as user-friendly message |
| Search caching | `Map` stores previous search results for performance |

---

## Testing Checklist

- [x] Valid JSON loads and displays all 8 courses  
- [x] Search by course code (e.g. "ICS")  
- [x] Search by instructor name (e.g. "Wilson")  
- [x] Search by topic (e.g. "Python")  
- [x] Department filter works independently  
- [x] Credits filter works independently  
- [x] Combined search + filter works correctly  
- [x] Empty search clears to all courses  
- [x] View Details modal shows full course info  
- [x] Add Course form validates required fields  
- [x] Add Course with invalid email shows error  
- [x] Export downloads valid JSON file  
- [x] Mobile layout tested on small screens  

---

## Author

Student Name: Noah Munz  