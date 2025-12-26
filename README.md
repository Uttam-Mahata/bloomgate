# BloomGate

**BloomGate** is a Smart Exam Paper Generator powered by **BloomJoin**. This full-stack application streamlines the process of creating, managing, and generating exam papers, utilizing advanced filtering and management techniques.

## Project Architecture

The repository is structured as a monorepo containing two main applications:

- **Backend:** A robust RESTful API built with [NestJS](https://nestjs.com/). It handles data persistence, exam logic, question management, and the core BloomJoin algorithms.
- **Frontend:** A modern, responsive user interface built with [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), and [Tailwind CSS](https://tailwindcss.com/).

## Tech Stack

### Backend
-   **Framework:** NestJS v11
-   **Language:** TypeScript
-   **Testing:** Jest
-   **Architecture:** Modular (Controllers, Services, Providers)

### Frontend
-   **Framework:** Next.js v16
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS v4
-   **UI Library:** React v19

## Features

-   **Exam Management:** Create and organize exams.
-   **Question Bank:** Manage a repository of questions.
-   **BloomJoin Integration:** Utilizes Bloom Filter logic for efficient data handling/querying (implied by `bloom-filter` module).
-   **Email Services:** Integrated email notification capabilities.

## Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (Latest LTS recommended)
-   npm or yarn

### Installation & Running

#### Backend
The backend runs on `http://localhost:3000` by default (check `main.ts` to confirm port if different).

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run start:dev
    ```

#### Frontend
The frontend runs on `http://localhost:3000` by default (if backend is also on 3000, Next.js will typically try 3001, or you may need to configure ports).

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Project Structure

```
/
├── backend/            # NestJS API application
│   ├── src/
│   │   ├── bloom-filter/
│   │   ├── exams/
│   │   ├── questions/
│   │   └── ...
│   └── ...
├── frontend/           # Next.js Client application
│   ├── app/
│   ├── public/
│   └── ...
└── README.md           # Project documentation
```

## License

This project is licensed under the MIT License.
