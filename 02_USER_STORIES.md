# The Educator — User Stories
**Version:** 0.1  
**Date:** 2026-07-06

## User Story Format
User stories will follow:

**As a** [user role],  
**I want** [capability],  
**so that** [value/benefit].

Each story may include acceptance criteria.

---

# Course Management Subsystem

## Story 1: Add a Course
**As a** professor,  
**I want** to add a course using course name, course code, academic year, semester, and Gregorian year,  
**so that** I can start managing all materials and activities related to the course.

### Acceptance Criteria
- The professor can enter course name.
- The professor can enter course code.
- The professor can select semester.
- The professor can enter or select Gregorian academic year.
- The system creates a course workspace.
- The professor can later edit or delete the course.

---

## Story 2: Add and Manage Course Content
**As a** professor,  
**I want** to add, edit, delete, enable, disable, and reorganize course content,  
**so that** the course remains flexible and easy to update.

### Acceptance Criteria
- The professor can add content items.
- The professor can edit content metadata.
- The professor can delete content.
- The professor can disable content without deleting it.
- The professor can re-enable disabled content.
- The professor can organize content by type, week, topic, or category.

---

## Story 3: Upload Course Resources
**As a** professor,  
**I want** to upload PDFs, PowerPoint slides, videos, links, and syllabus files,  
**so that** all teaching resources are centralized.

### Acceptance Criteria
- Supported file/resource types include:
  - PDF
  - PowerPoint
  - Video
  - External links
  - Syllabus
- Each resource can have a title.
- Each resource can have an optional description.
- Each resource can be edited, deleted, enabled, or disabled.

---

## Story 4: Optional Learning Outcomes
**As a** professor,  
**I want** learning outcomes to be optional,  
**so that** I can use them only when needed.

### Acceptance Criteria
- Learning outcomes can be enabled or disabled per course.
- Learning outcomes can be added later.
- Learning outcomes can be hidden temporarily.
- Disabling learning outcomes should not break the course structure.

---

# Research Tracking Subsystem

## Story 5: Link Academic Profiles
**As a** professor,  
**I want** to connect my Google Scholar, ORCID, and ResearchGate profiles,  
**so that** the system can identify and track my academic research output.

### Acceptance Criteria
- The system stores academic profile links.
- The system can display connected profile sources.
- The system allows profile links to be updated.

---

## Story 6: Automatic Research Fetching
**As a** professor,  
**I want** the system to automatically fetch research updates,  
**so that** my research list remains current.

### Acceptance Criteria
- The system checks academic sources periodically.
- The system identifies newly added publications.
- The system updates the research list.
- The professor can review fetched results.

---

## Story 7: Research Metrics Dashboard
**As a** professor,  
**I want** a short dashboard of research metrics,  
**so that** I can quickly monitor my academic research status.

### Acceptance Criteria
- The dashboard shows key metrics.
- Metrics may include publication count, citation count, and source-specific indicators.
- Metrics are displayed in a concise format.
