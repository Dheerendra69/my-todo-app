# Task Management System

![Task Management System](./frontend/public/Hero-Page.png)

A responsive full-stack task management application for organizing tasks, managing priorities and due dates, collaborating through comments and replies, tracking subtasks, and customizing the user experience with themes, colors, labels, and multiple viewing options.

## Live Demo

[View Live Demo](https://my-todo-app-rose-eta.vercel.app)

## Features

### Authentication

* Google OAuth authentication
* Guest login
* Persistent guest tasks using Local Storage
* User profile management
* Logout functionality

### Task Management

* Create, update, and delete tasks
* Edit task title and description
* Change task due dates
* Manage task priority
* Task status management:

  * To Do
  * Doing
  * On Hold
  * Completed
* Multiple task colors
* Task search by name
* Multi-criteria task filtering
* Grid and list view
* Dedicated task details page with expanded task information

### Labels

* Add multiple labels while creating a task
* Associate multiple labels with a single task
* Display and manage labels within task information

### Subtasks

* Create subtasks associated with a task
* Update subtask information
* Change subtask priority
* Change subtask status
* Set due dates for subtasks
* Delete subtasks
* Manage subtasks directly from the task details page

### Comments and Collaboration

* Add comments to tasks
* Multiple users can comment on the same task
* Reply to other users' comments
* View task discussions and replies from the task details page

### User Experience

* Responsive design for desktop, tablet, and mobile
* Light and dark themes
* Persistent theme preferences
* Multiple color modes
* Persistent UI color preferences
* Reusable UI components
* Interactive task details and management interface

### Data Persistence

* Persistent task data for authenticated users
* Guest task persistence using Local Storage
* Persistent theme and color preferences
* Persistent guest-task preferences
* Task-label relationships stored in the database
* Support for task comments, replies, and subtasks

## Tech Stack

* **Frontend:** Next.js, TypeScript, Tailwind CSS
* **Backend:** NestJS, TypeScript
* **Database:** PostgreSQL
* **Authentication:** Google OAuth
* **Deployment:** Vercel for the frontend, Render for the backend and PostgreSQL database

## Core Functionality

The application provides a complete task management workflow where users can:

1. Authenticate using Google OAuth or continue as a guest.
2. Create and organize tasks with descriptions, priorities, statuses, due dates, colors, and labels.
3. Associate multiple labels with individual tasks.
4. Search and filter tasks using multiple criteria.
5. Switch between grid and list views.
6. Open a dedicated task details page for detailed task management.
7. Edit task titles, descriptions, priorities, statuses, and due dates.
8. Create, update, prioritize, and delete subtasks.
9. Add comments to tasks and participate in discussions.
10. Reply to comments made by other users.
11. Customize the application using light/dark themes and different color modes.
12. Access the application seamlessly across desktop, tablet, and mobile devices.

## Architecture

The project follows a full-stack architecture:

* **Next.js** handles the responsive frontend and user interface.
* **NestJS** provides REST APIs and backend business logic.
* **PostgreSQL** stores users, tasks, labels, task-label relationships, subtasks, comments, and other application data.
* **Google OAuth** handles authenticated user login.
* **Local Storage** provides persistence for guest users and UI preferences.
* **Vercel** hosts the frontend.
* **Render** hosts the NestJS backend and PostgreSQL database.

## Highlights

* Full-stack TypeScript application
* RESTful API architecture
* Google OAuth authentication
* Guest user support
* PostgreSQL relational database design
* Task-label relationships
* Nested task management through subtasks
* Collaborative comments and replies
* Responsive and reusable component architecture
* Persistent user interface preferences
* Multiple task views and filtering options
* Dedicated task details management interface
