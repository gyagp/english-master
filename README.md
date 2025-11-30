# English Learning Application

## Overview
This is a full-stack English learning application with Flashcards and Cloze practices.

## Tech Stack
- **Backend**: Node.js, Express, Prisma, SQLite
- **Frontend**: React, Vite, Tailwind CSS

## Setup & Run

### Prerequisites
- Node.js installed.

### 1. Server
The server handles API requests and database operations.

```bash
cd server
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
Server runs on `http://localhost:3000`.

### 2. Client
The client is the user interface.

```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

## Features
- **Login/Register**: Create an account to track progress.
- **Dashboard**: View units, lessons, and overall progress.
- **Flashcards**: Learn vocabulary with flip cards. Mark words as "Grasped".
- **Practice**: Fill-in-the-blank exercises.