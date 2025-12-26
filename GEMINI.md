# BloomGate Project

## Project Overview
BloomGate is a full-stack web application designed as a "Smart Exam Paper Generator". The project is structured as a monorepo with distinct backend and frontend applications.

- **Backend:** A NestJS application providing the API and core logic.
- **Frontend:** A Next.js application (App Router) using React and Tailwind CSS for the user interface.

## Technology Stack

### Backend
- **Framework:** NestJS (v11)
- **Language:** TypeScript
- **Runtime:** Node.js
- **Key Libraries:** `rxjs`, `uuid`
- **Testing:** Jest (Unit and E2E)
- **Linting/Formatting:** ESLint, Prettier

### Frontend
- **Framework:** Next.js (v16)
- **Library:** React (v19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Linting:** ESLint

## Getting Started

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the application:
    -   **Development (Watch Mode):**
        ```bash
        npm run start:dev
        ```
    -   **Standard Start:**
        ```bash
        npm run start
        ```
4.  Run tests:
    -   **Unit Tests:** `npm run test`
    -   **E2E Tests:** `npm run test:e2e`

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:3000`.
4.  Build for production:
    ```bash
    npm run build
    ```
5.  Start production server:
    ```bash
    npm run start
    ```

## Development Conventions

-   **Monorepo Structure:** Keep backend and frontend concerns separate in their respective directories.
-   **TypeScript:** Both projects use TypeScript. Ensure strict typing and avoid `any` where possible.
-   **NestJS Architecture:** Follow the modular architecture (Controllers, Providers, Modules).
-   **Next.js App Router:** Use the `app/` directory structure for routing and layout.
-   **Styling:** Use Tailwind CSS utility classes for styling frontend components.
-   **Formatting:** Respect the `.prettierrc` and `eslint.config.mjs` configurations in both projects.

## Key Directories
-   `backend/src/`: Source code for the NestJS application.
-   `backend/test/`: End-to-end tests for the backend.
-   `frontend/app/`: Next.js App Router pages and layouts.
-   `frontend/public/`: Static assets for the frontend.
