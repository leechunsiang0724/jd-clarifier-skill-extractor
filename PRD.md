# Step 1: Product Overview & Problem Statement

Product Name: JD Refine & Skills Extractor (Internal Working Title)
The Problem: HR recruiters often write inconsistent job descriptions (JDs) that lack clarity or contain biased language. Additionally, critical technical skills are often lost in paragraphs of text, making it hard for Applicant Tracking Systems (ATS) to filter candidates.
The Solution: A web-based tool that uses AI to rewrite messy notes into professional JDs and automatically extracts a structured list of skills (tags) for ATS integration.

# Step 2: User Personas & Stories

Primary User (HR Recruiter):
Story: "As a recruiter, I want to paste rough notes from a hiring manager and get a polished JD so that I can post the job in under 5 minutes."
Story: "As a recruiter, I want the system to auto-detect skills like 'Python' or 'Agile' so I don't have to manually tag them in our database."
Secondary User (Hiring Manager):
Story: "As a manager, I want to quickly approve the technical accuracy of a JD without logging into a complex HR system."

# Step 3: Functional Requirements (The "Must-Haves")

## 3.1. Input Module

Text Entry: A large text area supporting rich text (bold, bullet points).
File Parsing: Ability to upload PDF or DOCX files to extract raw text.
Configuration: Dropdown selectors for:
Tone: (e.g., Corporate, Startup/Casual, Academic).
Length: (Concise vs. Detailed).

## 3.2. The AI Engine (Core Feature)

Clarification Logic: The backend must utilize an LLM (like GPT-4 or Claude) to:
Correct grammar and spelling.
Remove gender-coded or biased language.
Standardize formatting (About Us $
ightarrow$ Role $
ightarrow$ Requirements).
Skill Extraction Logic: The system must identify keywords and categorize them:
Hard Skills: (e.g., Java, SQL, Forklift Driving).
Soft Skills: (e.g., Leadership, Communication).

## 3.3. The Editor Interface

Split View: A "Before & After" comparison view to show changes.
Interactive Tags: Extracted skills should appear as "Chips" that can be deleted (x) or added (+).
One-Click Copy: Button to copy the cleaned text to clipboard.

## 3.4. Workflow & Approval

Shareable Links: Generate a unique, time-limited URL for the Hiring Manager to view the draft.
Feedback Loop: Allow the Manager to "Approve" or "Comment" on specific sections.

# Step 4: Non-Functional Requirements

Data Privacy (Crucial): Since JDs might contain confidential internal strategy, data sent to the AI provider must be opted out of model training (Enterprise API privacy standards).
Latency: Text generation and extraction must complete in under 10 seconds.
Responsiveness: The Manager's approval view must be mobile-friendly (they will likely check it on a phone).

# Step 5: Wireframe Description (Visualizing the Main Screen)

Top Bar: Project Name | User Profile | "New Job" Button
Left Column (Input):Label: "Original Notes"[Large Text Area]Action Button: "Analyze & Refine"
Middle Column (Output):Label: "Polished JD"[Rich Text Editor] containing the AI-generated text.Toggle: "Show Bias Warnings" (Highlights problematic words).
Right Sidebar (Data):Label: "Extracted Skills"Section: Must Haves (Tags: [Python] [React])Section: Nice to Haves (Tags: [AWS] [Jira])Button: "Export to ATS"

# Step 6: MVP Roadmap

1. Setup Authentication and Basic Text Input/Output with AI integration.
2. Implement Skill Extraction logic and Tag management UI.
3. Build the "Share with Manager" (Guest View) workflow.
4. Export features (PDF/JSON) and UI Polish.
