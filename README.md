# OutreachHub – MERN Stack Learning Project

OutreachHub is a SaaS platform designed to help businesses manage their contacts, create simple message templates, and simulate targeted campaigns. The project is part of a hands-on full-stack learning journey using the MERN stack (MongoDB, Express.js/NestJS, React, Node.js), with additional technologies such as Git, TypeScript, HTML, CSS/SCSS, and JavaScript.

## 🌐 Project Objective

Build a multi-tenant platform with two main portals:

- **Admin Portal:** For managing business workspaces and workspace users.
- **OutreachHub Portal:** For workspace users to manage contacts, templates, campaigns, and view analytics.

## 🧠 Key Concepts

- Multi-tenant SaaS application structure
- Full-stack architecture using MERN
- RESTful API design
- Role-based access control (Admin, Editor, Viewer)
- Campaign simulation with virtual message tracking
- Reusability and modular code organization

---


## 🧩 Modules Overview

### 👨‍💼 Admin Portal

- **Authentication Module**
  - Login
  - Logout
- **Workspaces Module**
  - CRUD operations on Workspaces
  - Manage Workspace Users

### 🧑‍💻 OutreachHub Portal

- **Authentication Module**
- **Home Module**
  - Analytics (charts + tables)
- **Contacts Module**
  - List, View, Create, Update, Delete contacts
  - Tag-based filtering
- **Message Templates Module**
  - Text and Text+Image templates
- **Campaigns Module**
  - Draft, Launch, Copy, View Status
  - Store real-time campaign results

---

## ✅ Git & GitHub Setup

Steps followed for Git-based project management:

1. Created a GitHub repository named `OutreachHub`.
2. Cloned the repo locally using `git clone`.
3. Created and committed a `README.md` file on the `main` branch.
4. Created a feature branch for changes:
   - Modified `README.md`.
   - Created a dummy `index.html` file.
5. Pushed the branch and opened a Pull Request.
6. Collaborator reviewed and approved the PR.
7. Merged the PR and deleted the branch locally and remotely.
8. Repeated similar process using `fork` + PR method for practice.

---

## 🖼️ HTML Layout Design

### 🔐 Authentication Module

- Login page:
  - Username and Password fields
  - Submit button navigates to Home page
- Navigation bar includes a Logout button

### 🏠 Home Module

- Welcome message with branding
- Placeholder for:
  - Analytics Charts (Campaigns per day, Messages per type, Contacts reached)
  - Tables (Recent campaigns, Top contact tags)
- Navigation links to other modules

### 📇 Contacts Module

- **Contacts List Page**
  - Table view of all contacts
  - Actions: View, Edit, Delete
  - Search and pagination
  - "+ Add New Contact" button

- **View Contact Page**
  - Shows contact details: Name, Phone, Tags
  - Actions: Edit, Delete

- **Create/Edit Contact Page**
  - Form with fields for name, phone number, and tags
  - Submit button to save contact

---

More sections coming soon: CSS/SCSS, JavaScript integration, Backend with MongoDB and Node.js/NestJS, and React UI.

---

## 🧠 Learning Outcome

By the end of this project, I aim to understand full-stack development, implement a scalable multi-tenant architecture, and integrate modern frontend-backend technologies in a real-world project scenario.

