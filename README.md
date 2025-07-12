Problem Statement - 2: StackIt – A Minimal Q&A Forum Platform
## Members
1. Binayak Bhattacharjee - binayakb1604@gmail.com
2. Atharva Phadtare - atharvamp04@gmail.com
3. Harsh Kapse - kapseharsht@gmail.com
4. Tejas Patil - 2022.tejas.patil@ves.ac.in
# Odoo-Hackathon: StackIt – A Minimal Q&A Forum Platform

This is a full-stack Q&A platform built with the MERN stack (MongoDB, Express, React, Node.js). It allows users to ask questions, post answers, comment, and vote on both questions and answers.

## Features

- User authentication (signup, login) with JWT.
- Ask questions with tags.
- Post answers to questions.
- Comment on answers.
- Upvote/downvote questions and answers.
- View questions by tags.
- User profiles.
- Protected routes for authenticated users.

## Tech Stack

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **React Router:** For declarative routing in React.
- **Material-UI:** A popular React UI framework.
- **Axios:** A promise-based HTTP client for the browser and Node.js.
- **react-quill:** A rich text editor.

### Backend

- **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB:** A cross-platform document-oriented database program.
- **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **JWT (JSON Web Tokens):** For secure user authentication.
- **bcryptjs:** For hashing passwords.
- **cors:** For enabling Cross-Origin Resource Sharing.
- **dotenv:** For managing environment variables.


## Setup and Installation

### Prerequisites

- Node.js and npm
- MongoDB

### Backend Setup

1.  Navigate to the `backend` directory:
    `cd backend`
2.  Install the dependencies:
    `npm install`
3.  Create a `.env` file in the `backend` directory and add the following environment variables:

    ```
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    ```

4.  Start the backend server:
    `npm start`

### Frontend Setup

1.  Navigate to the `frontend` directory:
    `cd frontend`
2.  Install the dependencies:
    `npm install`
3.  Start the frontend development server:
    `npm start`

The application should now be running on `http://localhost:3000`.

## API Endpoints

The backend exposes the following REST API endpoints:

-   `POST /api/auth/register`: Register a new user.
-   `POST /api/auth/login`: Log in a user.
-   `GET /api/auth/user`: Get the currently authenticated user.
-   `GET /api/questions`: Get all questions.
-   `GET /api/questions/:id`: Get a single question by ID.
-   `POST /api/questions`: Create a new question.
-   `PUT /api/questions/:id/upvote`: Upvote a question.
-   `PUT /api/questions/:id/downvote`: Downvote a question.
-   `POST /api/answers`: Add an answer to a question.
-   `PUT /api/answers/:id/upvote`: Upvote an answer.
-   `PUT /api/answers/:id/downvote`: Downvote an answer.
-   `POST /api/answers/:id/comments`: Add a comment to an answer.
-   `GET /api/tags`: Get all tags.
-   `GET /api/tags/:tagName`: Get questions by tag.
-   `GET /api/notifications`: Get user notifications.
-   `POST /api/notifications/mark-read`: Mark notifications as read.

Feel free to explore the code for more details on the implementation.
