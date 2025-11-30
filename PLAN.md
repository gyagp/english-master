# English Learning Application Design Plan

## 1. Architecture Overview
We will build a web-based application using a Client-Server architecture.
- **Backend**: Node.js with Express.js.
- **Database**: SQLite (using Prisma ORM) for easy local setup and relational data management.
- **Frontend**: React (using Vite) for a responsive and interactive user interface (especially for the Flashcard feature).

## 2. Database Schema
We will use a relational database to track content and user progress.

### Tables:
1.  **User**
    - `id`: Integer (PK)
    - `username`: String (Unique)
    - `password`: String (Hashed)
    - `createdAt`: DateTime

2.  **Word** (Vocabulary)
    - `id`: Integer (PK)
    - `unitId`: Integer
    - `lessonId`: Integer
    - `word`: String
    - `phonetic`: String
    - `englishMeaning`: String
    - `chineseMeaning`: String
    - `example`: String

3.  **Practice** (Cloze)
    - `id`: Integer (PK)
    - `unitId`: Integer
    - `lessonId`: Integer
    - `cloze`: String (Sentence with a blank)
    - `answer`: String (Correct word/phrase)

4.  **UserWordProgress**
    - `userId`: Integer (FK -> User)
    - `wordId`: Integer (FK -> Word)
    - `isCompleted`: Boolean (Default: false)
    - Primary Key: `(userId, wordId)`

5.  **UserLessonProgress**
    - `userId`: Integer (FK -> User)
    - `unitId`: Integer
    - `lessonId`: Integer
    - `isCompleted`: Boolean
    - Primary Key: `(userId, unitId, lessonId)`

6.  **UserPracticeProgress**
    - `userId`: Integer (FK -> User)
    - `practiceId`: Integer (FK -> Practice)
    - `isCompleted`: Boolean (Default: false)
    - Primary Key: `(userId, practiceId)`

## 3. API Endpoints (Backend)

### Authentication
- `POST /api/auth/register`: Create a new account.
- `POST /api/auth/login`: Login and receive a token (JWT).

### Content
- `GET /api/structure`: Get available units and lessons (derived from Words/Practices).
- `GET /api/units/:unitId/lessons/:lessonId/words`: Get vocabulary for a specific lesson.
- `GET /api/units/:unitId/lessons/:lessonId/practices`: Get practices (clozes) for a specific lesson.

### Progress
- `GET /api/progress`: Get user's overall progress.
- `POST /api/words/:id/toggle`: Toggle "Completed" status for a word.
- `POST /api/practices/:id/complete`: Mark a practice as completed.
- `POST /api/units/:unitId/lessons/:lessonId/complete`: Mark a lesson as completed.

## 4. Frontend Features (UI/UX)

### 1. Login/Register Screen
- Simple forms for user access.

### 2. Dashboard
- Displays list of Units.
- Expand a Unit to see Lessons.
- Visual indicator of progress (e.g., "3/10 words completed").

### 3. Lesson View
- Tabs for **"Learn Words"** and **"Practice"**.

### 4. Flashcard Mode (Vocabulary)
- **Card UI**:
    - **Front**: Word + Phonetic symbol.
    - **Back** (Click to flip): English Meaning, Chinese Meaning, Example Sentence.
- **Controls**:
    - "Mark as Completed" button (moves word to "Completed" list).
    - "Review" list (shows completed words, allows un-marking).

### 5. Practice Mode (Cloze)
- Display sentence with a blank.
- Input field for user to type the answer.
- "Check" button to validate answer.
- Immediate feedback (Correct/Incorrect).

## 5. Implementation Steps
1.  **Setup**: Initialize project structure (client/server), install dependencies.
2.  **Database**: Define Prisma schema, run migrations, seed initial data (Units/Lessons/Words).
3.  **Backend API**: Implement Auth and Content endpoints.
4.  **Frontend**: Build React components for Login, Dashboard, Flashcards.
5.  **Integration**: Connect Frontend to Backend.

---
Please review this plan. If you agree, I will proceed with the implementation starting with the project setup.
