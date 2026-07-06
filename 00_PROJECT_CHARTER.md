# The Educator — Project Charter
**Version:** 0.1  
**Date:** 2026-07-06  
**Status:** Living Reference Document

## 1. Project Name
**The Educator**

## 2. Vision
The Educator is a modular academic platform designed first for Dr. Abdulaziz Attaallah as a university professor, then expandable to serve other faculty members and academic professionals.

The platform aims to support academic work through integrated subsystems for course management, educational resources, assessment, grading, research tracking, and future academic productivity tools.

## 3. Initial Scope
The first phase focuses on two core subsystems:

### 3.1 Course Management Subsystem
A subsystem for creating and managing courses, course resources, syllabi, assessments, files, links, videos, and teaching materials.

### 3.2 Research Tracking Subsystem
A subsystem for automatically tracking the professor’s personal research profile from platforms such as Google Scholar, ORCID, and ResearchGate, including key research metrics.

## 4. Long-Term Product Direction
The platform should be designed with flexibility, sustainability, modifiability, and extensibility in mind so that it can evolve over years without major restructuring.

## 5. Initial Architecture Direction
The recommended architecture is a **modular monolith first**, designed with clear subsystem boundaries so that it can later evolve into microservices if the platform becomes large or commercial.

Suggested future-ready modules:
- Course Management
- Content & Resource Management
- Assessment & Grading
- Research Tracking
- User & Role Management
- Reporting & Analytics
- Integration Services

## 6. Technology Direction
Possible stack:
- Frontend: React / Next.js
- Backend: .NET / ASP.NET Core with C#
- Database: PostgreSQL or SQL Server
- Cloud: Azure, AWS, or Google Cloud
- Storage: Cloud object storage for files and educational resources

.NET is not limited to Azure. It can run on Azure, AWS, Google Cloud, Linux servers, Docker containers, and self-hosted environments.

## 7. Documentation Methodology
The project will use an Agile documentation style, including:
- Product Backlog
- Epics
- User Stories
- Sprint Planning
- Sprint Review
- Change Log
- Living Requirements

This documentation set is the project’s living reference and should be updated continuously as the idea evolves.
