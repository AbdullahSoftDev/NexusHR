<div align="center">
  <img
    src="https://github.com/AbdullahSoftDev/Pictures/blob/a768400d75eac1113b1a5d7ed696b2ff4f9cc3c6/nexushr-frontend.png"
    alt="Nexus-Frontend-banner.png"
    width="100%"
  />

---
# 🧑‍💼 NexusHR — HR Management Dashboard Frontend
</div>

<div align="center">


### A Modern, Interactive & Responsive Human Resource Management Interface

NexusHR is a modern **HR Management Dashboard frontend** built with React, TypeScript, Vite, Tailwind CSS, Motion, Recharts, and other modern web technologies.

It provides a polished interface for managing and visualizing common HR workflows including employees, attendance, leave, payroll, dashboards, notifications, authentication, and application settings.

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)
![Motion](https://img.shields.io/badge/Motion-12-FF0055?style=for-the-badge)
![Recharts](https://img.shields.io/badge/Recharts-3-FF6384?style=for-the-badge)

<br/>

[✨ Features](#-features) •
[🧩 Modules](#-application-modules) •
[🛠️ Tech Stack](#️-technology-stack) •
[📁 Structure](#-project-structure) •
[🚀 Setup](#-getting-started)

</div>

---

# 📖 About NexusHR

**NexusHR** is a modern Human Resource Management interface designed to bring essential HR operations into one clean and intuitive dashboard.

The project focuses heavily on **frontend engineering, UI architecture, component organization, responsive design, animations, data visualization, and user experience**.

Instead of presenting HR information through a collection of disconnected pages, NexusHR organizes the experience around a centralized dashboard and modular application sections.

The interface is designed to feel like a modern SaaS product rather than a traditional administrative panel.

### 🎯 Main Goals

NexusHR was designed with several goals in mind:

* Build a modern HR dashboard experience
* Keep the interface clean and easy to navigate
* Organize HR functionality into reusable React components
* Create responsive layouts for different screen sizes
* Provide meaningful visualizations for HR data
* Use animations to make interactions feel smooth
* Maintain a scalable frontend architecture
* Keep application state organized through React Context
* Make individual HR modules easy to maintain and extend
* Provide a professional UI suitable for a real-world HR platform

---

# ✨ Features

## 📊 Interactive Dashboard

The dashboard acts as the central workspace of NexusHR.

It brings important HR information together into a single interface so users can quickly understand the current workforce situation.

### Dashboard capabilities include:

* Employee statistics
* Workforce overview
* Attendance information
* Leave information
* Payroll-related metrics
* Performance-oriented data
* Quick action areas
* Interactive charts
* Summary cards
* Recent activity
* Visual data representation

The dashboard is designed to minimize unnecessary navigation and provide important information at a glance.

---

# 👥 Employee Management

The employee module provides a structured interface for viewing and managing employee information.

### Employee functionality includes:

* Employee listing
* Employee information cards
* Employee details
* Employee status
* Department information
* Position information
* Employee search
* Employee filtering
* Employee selection
* Employee-focused actions

The employee interface is organized around reusable components, allowing the module to be extended without restructuring the entire application.

---

# 🕐 Attendance Management

NexusHR includes a dedicated attendance interface for presenting workforce attendance information.

The attendance section is designed to make attendance data easy to understand through structured layouts and visual indicators.

### Attendance interface includes:

* Attendance overview
* Daily attendance information
* Attendance statistics
* Employee attendance records
* Attendance status indicators
* Check-in / check-out interface
* Attendance summaries
* Visual attendance information

The module is designed to provide HR users with a quick overview of workforce attendance.

---

# 🏖️ Leave Management

The leave module provides a dedicated interface for handling employee leave information.

### Leave features include:

* Leave requests
* Leave status
* Leave categories
* Leave summaries
* Request information
* Approval-oriented interface
* Rejection-oriented interface
* Leave statistics
* Employee leave information

Different leave states can be represented visually, allowing users to understand request status quickly.

---

# 💰 Payroll Management

The payroll module provides a dedicated interface for presenting payroll-related HR information.

### Payroll interface includes:

* Payroll overview
* Salary-related information
* Employee payroll data
* Payroll summaries
* Payroll statistics
* Payroll visualization
* Employee-specific payroll information

The interface is designed around clarity, allowing important financial HR information to be presented without overwhelming the user.

---

# 🔐 Authentication Interface

NexusHR includes a dedicated authentication experience.

The authentication interface provides the entry point into the HR dashboard and is separated from the main application layout.

### Authentication UI includes:

* Login interface
* Authentication states
* Form interactions
* Validation-oriented UI
* Loading states
* Error feedback
* Smooth transitions

The authentication module is designed to integrate cleanly with the application's global state architecture.

---

# ⚙️ Settings

The settings section provides a centralized location for application configuration and user preferences.

The module follows the same visual language as the rest of the application, ensuring that settings feel like an integrated part of the NexusHR experience rather than a separate interface.

---

# 🔔 Notifications

NexusHR provides notification-oriented UI components for communicating application events and actions to users.

Notifications can be used for:

* Successful actions
* Failed actions
* Warnings
* Informational messages
* State changes
* User feedback

This helps make interactions feel immediate and understandable.

---

# 📈 Data Visualization

NexusHR uses **Recharts** to create interactive data visualizations.

Charts allow HR information to be communicated visually rather than relying exclusively on tables and numerical values.

### Visualization use cases include:

* Workforce statistics
* Attendance trends
* Payroll information
* Leave statistics
* HR performance metrics
* Dashboard summaries

The visualizations are integrated directly into the dashboard experience.

---

# ✨ Animations & Motion

NexusHR uses **Motion** to enhance the overall user experience.

Animations are used to make interactions feel smoother and more natural rather than simply decorating the interface.

### Motion can be used throughout the interface for:

* Page transitions
* Component entrance animations
* Modal animations
* Hover interactions
* Dashboard transitions
* Loading states
* Micro-interactions
* UI state changes

The goal is to create an interface that feels responsive and alive without sacrificing usability.

---

# 🎉 Interactive Feedback

The frontend also includes `canvas-confetti` for celebratory UI moments.

This can be used to visually acknowledge successful actions or important user interactions.

Small interactions like this help make the application feel more polished and engaging.

---

# 🧩 Application Modules

The NexusHR frontend is divided into several independent functional areas.

```text
NexusHR
│
├── 🔐 Authentication
│
├── 📊 Dashboard
│
├── 👥 Employees
│
├── 🕐 Attendance
│
├── 🏖️ Leave
│
├── 💰 Payroll
│
├── ⚙️ Settings
│
└── 🔔 Notifications
```

Each section is represented through its own component structure, allowing functionality to remain separated and maintainable.

---

# 🏗️ Frontend Architecture

NexusHR follows a **component-based React architecture**.

The application is centered around `App.tsx`, with application-level state provided through the HR context.

A simplified representation of the architecture is:

```text
                         ┌─────────────────────┐
                         │      NexusHR UI     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       App.tsx       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     HRContext       │
                         │  Application State  │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │  Dashboard  │       │  Employees  │       │ Attendance  │
       └─────────────┘       └─────────────┘       └─────────────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌────────────┐     ┌────────────┐     ┌────────────┐
          │    Leave   │     │  Payroll   │     │  Settings  │
          └────────────┘     └────────────┘     └────────────┘
```

This structure allows individual modules to evolve independently while remaining part of the same application.

---

# 🧠 State Management

NexusHR uses React Context for centralized application state.

The primary context is:

```text
src/context/HRContext.tsx
```

The context provides a central location for application-level HR state and allows multiple components to access shared information without unnecessarily passing props through multiple layers.

### Benefits of this approach:

* Centralized state
* Reduced prop drilling
* Shared application information
* Cleaner component interfaces
* Easier state updates
* Better scalability

---

# 🧱 Component Architecture

The UI is organized into feature-oriented component directories.

```text
src/
│
├── components/
│   ├── attendance/
│   ├── auth/
│   ├── common/
│   ├── dashboard/
│   ├── employees/
│   ├── layout/
│   ├── leave/
│   ├── payroll/
│   └── settings/
│
├── context/
├── data/
├── lib/
├── services/
├── types/
│
├── App.tsx
├── index.css
└── main.tsx
```

This organization keeps related functionality together and makes the codebase easier to navigate.

---

# 📁 Project Structure

```text
Frontend/
│
├── 📂 src/
│   │
│   ├── 📂 components/
│   │   │
│   │   ├── 📂 attendance/
│   │   │   └── Attendance UI components
│   │   │
│   │   ├── 📂 auth/
│   │   │   └── Authentication components
│   │   │
│   │   ├── 📂 common/
│   │   │   └── Reusable UI components
│   │   │
│   │   ├── 📂 dashboard/
│   │   │   └── Dashboard components
│   │   │
│   │   ├── 📂 employees/
│   │   │   └── Employee management components
│   │   │
│   │   ├── 📂 layout/
│   │   │   └── Application layout components
│   │   │
│   │   ├── 📂 leave/
│   │   │   └── Leave management components
│   │   │
│   │   ├── 📂 payroll/
│   │   │   └── Payroll components
│   │   │
│   │   └── 📂 settings/
│   │       └── Settings components
│   │
│   ├── 📂 context/
│   │   └── HRContext.tsx
│   │
│   ├── 📂 data/
│   │   └── Application data
│   │
│   ├── 📂 lib/
│   │   └── Utility functions
│   │
│   ├── 📂 services/
│   │   └── Frontend service utilities
│   │
│   ├── 📂 types/
│   │   └── TypeScript types
│   │
│   ├── 📄 App.tsx
│   ├── 📄 index.css
│   └── 📄 main.tsx
│
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 README.md
├── 📄 bun.lock
├── 📄 index.html
├── 📄 metadata.json
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 vite.config.ts
```

The current repository contains dedicated component directories for attendance, authentication, common UI, dashboard, employees, layout, leave, payroll, and settings.

---

# 🛠️ Technology Stack

## ⚛️ React

The application is built using **React 19**.

React provides the component-based foundation of the entire interface.

It allows NexusHR to be divided into reusable UI modules instead of maintaining one large monolithic application component.

---

## 🔷 TypeScript

TypeScript provides static typing throughout the application.

It improves:

* Code reliability
* Developer experience
* Component interfaces
* Maintainability
* Refactoring safety
* Data modeling

The project uses TypeScript alongside React and includes a TypeScript configuration in the frontend root.

---

## ⚡ Vite

Vite powers the development and production build workflow.

It provides:

* Fast development startup
* Hot Module Replacement
* Efficient builds
* Modern JavaScript tooling
* Simple configuration

The project uses Vite for both development and production builds.

---

## 🎨 Tailwind CSS

Tailwind CSS is used as the primary styling system.

It allows the interface to be constructed using utility classes while maintaining responsive and consistent layouts.

Tailwind is especially useful for:

* Responsive design
* Spacing
* Typography
* Layouts
* Component styling
* Interactive states

---

## 🎬 Motion

Motion is used to create animated interactions and transitions.

It helps NexusHR provide a more polished experience through subtle movement and UI feedback.

---

## 📊 Recharts

Recharts powers the application's data visualization layer.

It provides React-based chart components that can be composed directly into dashboard interfaces.

---

## 🎯 Lucide React

Lucide React provides the icon system used throughout the application.

Icons are used across:

* Navigation
* Buttons
* Dashboard cards
* Tables
* Forms
* Status indicators
* Settings
* Actions

---

## 🧰 Utility Libraries

The frontend also uses several supporting libraries:

| Library           | Role                               |
| ----------------- | ---------------------------------- |
| `clsx`            | Conditional class names            |
| `tailwind-merge`  | Intelligent Tailwind class merging |
| `canvas-confetti` | Celebration effects                |
| `@google/genai`   | Gemini AI integration              |
| `dotenv`          | Environment configuration          |

These packages are currently listed in the frontend `package.json`.

---

# 🤖 AI Integration

NexusHR includes the Google Gemini SDK through:

```text
@google/genai
```

This provides the foundation for AI-powered functionality within the frontend.

AI configuration is kept outside the application source code through environment variables.

For example:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

The existing project configuration specifically includes `GEMINI_API_KEY` in the setup instructions.

> ⚠️ Never commit a real API key to the repository.

---

# 📱 Responsive Design

NexusHR is designed with responsive layouts in mind.

The interface is structured so that the major HR workflows can remain usable across different viewport sizes.

### Responsive considerations include:

* Flexible dashboard layouts
* Responsive cards
* Adaptive navigation
* Flexible tables
* Mobile-friendly spacing
* Scalable typography
* Responsive charts
* Flexible content containers

Tailwind CSS makes it possible to adapt individual components without duplicating entire layouts.

---

# 🎨 UI Design Philosophy

NexusHR follows a modern SaaS dashboard design philosophy.

The interface emphasizes:

### 🧹 Simplicity

Users should be able to understand the interface without needing extensive training.

### 📐 Consistency

Common UI patterns are reused across different HR modules.

### 👁️ Visual Hierarchy

Important information receives greater visual emphasis through typography, spacing, cards, charts, and status indicators.

### ⚡ Feedback

Interactions should provide clear visual feedback.

### 🧩 Modularity

Individual sections should remain independent enough to evolve without affecting unrelated parts of the application.

---

# 🧭 Navigation Structure

The application is organized around a central HR workspace.

A typical navigation structure is:

```text
NexusHR
│
├── Dashboard
│
├── Employees
│
├── Attendance
│
├── Leave
│
├── Payroll
│
├── Settings
│
└── Notifications
```

The active application section is managed through the application's state architecture.

---

# 🔄 User Experience Flow

A typical user journey through the interface can be represented as:

```text
                 ┌──────────────────┐
                 │      Login       │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │    Dashboard     │
                 └────────┬─────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   Employees         Attendance          Leave
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
          Payroll                 Settings
```

The goal is to keep navigation predictable while allowing each HR area to have its own dedicated interface.

---

# 🚀 Getting Started

## 📋 Prerequisites

Before running NexusHR locally, make sure you have:

* **Node.js**
* **npm**
* A modern web browser
* A Gemini API key if AI functionality is enabled

The repository's existing setup documentation lists Node.js as the prerequisite.

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/AbdullahSoftDev/NexusHR.git
```

Move into the frontend directory:

```bash
cd NexusHR/Frontend
```

---

## 2️⃣ Install Dependencies

Using npm:

```bash
npm install
```

The repository also contains a `bun.lock` file if you prefer using Bun.

---

## 3️⃣ Configure Environment Variables

Create the appropriate environment configuration based on `.env.example`.

For Gemini-powered functionality:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Keep API credentials private.

---

## 4️⃣ Start the Development Server

Run:

```bash
npm run dev
```

The project's Vite configuration starts the development server on port `3000`.

Then open:

```text
http://localhost:3000
```

---

# 📜 Available Scripts

The frontend currently provides the following npm scripts:

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Starts the Vite development server    |
| `npm run build`   | Builds the application for production |
| `npm run preview` | Previews the production build         |
| `npm run lint`    | Runs TypeScript checking              |
| `npm run clean`   | Removes generated build/server files  |

These scripts are defined in the current `Frontend/package.json`.

---

# 🏭 Production Build

To generate a production build:

```bash
npm run build
```

Vite will generate the production-ready output inside:

```text
dist/
```

The generated build can then be deployed to a static hosting provider or any environment capable of serving the resulting frontend assets.

---

# 🔍 Type Checking

NexusHR uses TypeScript's compiler for frontend validation.

Run:

```bash
npm run lint
```

The current script executes:

```bash
tsc --noEmit
```

This checks the project without generating compiled TypeScript files.

---

# 🧪 Development Workflow

A recommended development workflow is:

```text
1. Start Development Server
          │
          ▼
2. Select / Create Feature
          │
          ▼
3. Build Component
          │
          ▼
4. Integrate With Module
          │
          ▼
5. Update Shared State If Required
          │
          ▼
6. Test Responsive Layout
          │
          ▼
7. Run TypeScript Check
          │
          ▼
8. Build Production Version
```

This keeps new features isolated while maintaining the overall architecture.

---

# 🧩 Adding a New HR Module

A new module can follow the existing feature-oriented organization.

For example:

```text
src/components/
│
└── performance/
    │
    ├── PerformanceDashboard.tsx
    ├── PerformanceTable.tsx
    ├── PerformanceCard.tsx
    └── PerformanceDetails.tsx
```

The module can then be connected to the application navigation and state management.

This approach keeps features grouped by purpose instead of mixing unrelated components together.

---

# 🧱 Reusable Components

The project contains a `common` component area for UI elements that can be shared between multiple modules.

Examples of reusable UI patterns include:

* Cards
* Buttons
* Badges
* Modals
* Tables
* Inputs
* Dropdowns
* Status indicators
* Loading states
* Notifications

Reusable components help keep the application visually consistent.

---

# 📊 Data Visualization Strategy

Dashboard data should generally be presented using the appropriate visual format.

For example:

```text
Metric
  │
  ├── Simple number ───────► Statistic Card
  │
  ├── Comparison ──────────► Bar / Column Chart
  │
  ├── Trend ────────────────► Line Chart
  │
  ├── Distribution ────────► Pie / Donut Chart
  │
  └── Detailed records ────► Table
```

This keeps information understandable while avoiding unnecessary visual complexity.

---

# 🎯 Design Principles

When extending NexusHR, new components should follow these principles:

### 1. Reuse before duplicating

If a component already exists that solves a similar problem, reuse it.

### 2. Keep modules independent

Avoid putting employee-specific logic inside unrelated payroll or attendance components.

### 3. Keep components focused

A component should ideally have one clear responsibility.

### 4. Prefer shared utilities

Common styling and utility logic should live in reusable locations.

### 5. Maintain visual consistency

New interfaces should follow the existing design language.

### 6. Keep responsive behavior in mind

Components should not be designed only for desktop screens.

---

# 🔒 Environment & Security

NexusHR uses environment variables for configuration that should not be hardcoded into the source code.

For example:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### Never commit:

```text
.env
.env.local
API keys
Private credentials
Secret tokens
```

Use `.env.example` to document required configuration without exposing actual credentials.

---

# 🌐 Deployment

After creating a production build:

```bash
npm run build
```

the generated `dist/` directory can be deployed to a frontend hosting platform.

The application is a Vite-powered React frontend, making it suitable for modern static hosting environments.

---

# 🗂️ Repository Scope

This repository contains the **NexusHR frontend application**.

It is intentionally focused on:

* React components
* UI/UX
* Dashboard interfaces
* HR modules
* Application state
* Charts
* Animations
* Frontend utilities
* Client-side configuration
* AI-powered frontend functionality

### 🚫 This repository does not document or require a separate NexusHR backend.

The purpose of this repository is to provide the **frontend implementation and user interface** of NexusHR.

---

# 📚 What This Project Demonstrates

NexusHR demonstrates practical frontend development concepts including:

* React component architecture
* TypeScript
* Context API
* Feature-based component organization
* Responsive UI development
* Dashboard design
* Data visualization
* Animation systems
* Reusable UI components
* Modern CSS workflows
* Vite development
* Environment configuration
* AI SDK integration
* Frontend project organization

It can also serve as a reference project for developers learning how to structure a larger React dashboard application.

---

# 🔮 Future Improvements

Potential future improvements include:

* Advanced employee filtering
* More detailed HR analytics
* Additional dashboard widgets
* Dark mode
* More advanced animation presets
* Improved mobile navigation
* Exportable reports
* More visualization types
* Enhanced accessibility
* Expanded AI-assisted HR features
* Additional reusable UI primitives
* More granular application preferences

---

# 🧑‍💻 Development Notes

When working on NexusHR, the recommended approach is to keep the frontend organized around **features rather than individual pages**.

For example:

```text
Good:

components/
├── employees/
├── attendance/
├── leave/
└── payroll/
```

rather than placing every component into one large directory:

```text
components/
├── EmployeeCard.tsx
├── AttendanceTable.tsx
├── LeaveModal.tsx
├── PayrollChart.tsx
├── EmployeeModal.tsx
└── ...
```

Feature-oriented organization makes larger React applications easier to understand and maintain.

---

# ⭐ Why NexusHR?

NexusHR combines several important frontend concepts into one practical project:

```text
                 ┌─────────────────────────┐
                 │        NexusHR           │
                 └────────────┬────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
     Modern UI           React Architecture   Data Visualization
          │                   │                   │
          ▼                   ▼                   ▼
     Tailwind CSS          TypeScript          Recharts
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   User Experience│
                     └─────────────────┘
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
          Motion         Responsive UI      AI Features
```

The result is a frontend that combines **functionality, visual design, interaction, and maintainable architecture** into one HR-focused application.

---

# 📌 Quick Start

If you just want to run NexusHR quickly:

```bash
git clone https://github.com/AbdullahSoftDev/NexusHR.git
cd NexusHR/Frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# 🤝 Contributing

Contributions and improvements are welcome.

A typical contribution workflow:

```bash
git checkout -b feature/your-feature
```

Make your changes, test them locally, and then create a pull request.

When contributing, try to:

* Keep components modular
* Follow the existing folder structure
* Avoid unnecessary duplication
* Maintain responsive layouts
* Keep TypeScript types accurate
* Test new UI states
* Run the TypeScript check before submitting

---

# 👨‍💻 Author

<div align="center">

## AbdullahSoftDev

Frontend Developer & Creator of NexusHR

Built with ❤️ using modern frontend technologies.

<br/>

⭐ **If you like NexusHR, consider giving the repository a star!**

</div>

---

# 📄 License

This project is available under the license specified in the repository.

---

<div align="center">

## 🧑‍💼 NexusHR

### Modern HR Management Interface

**Designed for clarity. Built for productivity.**

<br/>

⭐ Star the repository if you found it useful.

</div>
