# MindTrack – Student Mental Wellness Tracker

MindTrack is a production-ready, client-side web application designed to support students preparing for competitive and board exams (such as **JEE, NEET, UPSC, GATE, CAT, CUET, and Boards**). It assists students in tracking their daily moods, stress levels, energy, and sleep, identifying emotional triggers, maintaining a structured three-part reflection journal, practicing relaxation routines, and receiving personalized wellness insights.

---

## 🌟 Key Features

### 1. Welcome Dashboard & Exam Countdown
* **Daily Inspiration**: Greets the user with motivational student-focused quotes that can be refreshed on demand.
* **Streak & Countdown Tracking**: Automatically calculates consecutive check-in streaks and features an exam date countdown to keep students organized.
* **Recent Metrics Summary**: Computes and displays the last 7 logs' average values for Mood, Stress, Energy, and Sleep Quality in a responsive layout.

### 2. Multi-Metric Daily Check-In Form
* **Unified 1-10 Scale Sliders**: Interactive sliding range inputs with dynamic state indicators for tracking:
  * **Mood** (from flat to radiant)
  * **Stress** (from serene to overwhelmed)
  * **Energy** (from exhausted to energized)
  * **Sleep Quality** (from restless to deep sleep)
* **Exam Tracker**: Logs targeted preparation exams (`JEE`, `NEET`, `UPSC`, `CAT`, `GATE`, `CUET`, `Boards`, `Other`).
* **Stress Triggers**: Captures student stressors including *Exam pressure*, *Lack of preparation*, *Time management*, *Family expectations*, *Peer comparison*, *Result anxiety*, *Burnout*, and *Financial concerns*.

### 3. Accessible Multi-Axis Analytics Charts
* **Visual Representation**: Displays overlay line-graph trends for Mood, Stress, Energy, and Sleep Quality using clean, lightweight SVGs.
* **Parameter Filtering**: Features pill toggles to selectively display or hide specific metric series on the chart.
* **Correlational Analysis**: Highlights automated patterns such as sleep quality influence on energy level, and study hour thresholds compared to burnout.

### 4. Interactive Reflection Journal
* **Three-Part Log**: Encourages reflective thinking by dividing entries into:
  1. Main daily reflection text
  2. Dedicated **Gratitude card** (highlighted with a pink heart icon badge)
  3. Dedicated **Achievement/Win note** (highlighted with a golden award icon badge)
* **Security Shield**: Strips HTML tags on save to prevent Cross-Site Scripting (XSS) injections when rendering logs.

### 5. AI Wellness Support Engine & Status Dashboard
* **0-100 Wellness Score**: Formulates a weighted wellness index using study durations, sleeping metrics, active triggers, and log patterns.
* **Classification Badge**: Highlights status thresholds with distinct color codings:
  * **Healthy** (Green)
  * **Moderate Concern** (Yellow)
  * **High Stress** (Orange)
  * **Burnout Risk** (Red)
* **Student Advisory Guidelines**: Generates 6 actionable guidance sections: personalized encouragement, stress recommendations, study-life balance tips, sleep improvements, burnout assessments, and motivational reminders.
* *Note: Includes a visible student counseling non-medical disclaimer card.*

### 6. Focus & Relax Toolkit
* **Pomodoro Timer**: Set customizable study blocks accompanied by synthetic Web Audio chimes (no external audio assets required).
* **Breathing Regulator**: Follow a dynamic guided expanding-ring visualizer for breathing in, holding, and breathing out.

---

## 🛠️ Technology Stack

* **Core Framework**: React 19 (TypeScript)
* **Scaffolding Tool**: Vite
* **Icons**: Lucide React
* **Styling**: Vanilla CSS (CSS Variables, responsive Flexbox/Grid layouts, glassmorphism card designs, and dark mode support)
* **Testing Library**: Vitest + Vitest Coverage V8

---

## ♿ Accessibility & Security (WCAG AA Compliance)

* **Keyboard Navigation**: Uses proper focus styling with high-contrast outlines across interactive components.
* **Accessible Dialogs & Details**: Employs semantic `<details>` and `<summary>` wrappers for accordions, allowing seamless keyboard navigation and screen reader support.
* **Hidden Screen Reader Tables**: Employs `sr-only` utility classes to output accessible tabular text representations for SVG line charts, rendering graphics fully readable to screen readers.
* **Input Sanitization**: Automatically escapes HTML tags (`&`, `<`, `>`, `"`, `'`, `/`) on entry submissions.

---

## 🧪 Automated Testing & Coverage

The codebase includes an extensive suite of unit tests written in **Vitest**. The test suite covers wellness calculations, classification models, recommendations, input sanitizers, and date logs.

### Run Tests
```bash
npm test
```

### Run Coverage Report
```bash
npm run test:coverage
```

#### Coverage Audit Metrics
* **Statements Coverage**: `92.7%`
* **Branch Coverage**: `84.09%`
* **Functions Coverage**: `95.45%`
* **Lines Coverage**: `93.16%`

---

## 🚀 Building and Running Locally

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
The application will bundle optimized client-side assets inside the `/dist` directory, ready to be hosted on static file hosting providers.
