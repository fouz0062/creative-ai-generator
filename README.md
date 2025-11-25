# ZiaGen - Creative AI Image Generator

**ZiaGen** is a cutting-edge, serverless generative AI application that allows users to create stunning images from text prompts. Built with a modern Next.js frontend and powered by AWS cloud services, ZiaGen offers a seamless and powerful creative experience.

## 🚀 Project Status

**Current Phase:** Complete - Next.js UI & Mock Data

We have successfully built the complete frontend user interface with functional mock data. The application's look, feel, and user flow are fully realized.

## ✨ Key Features (Phase 1 Implemented)

- **Modern Dark Mode UI:** A sleek, professional dark-themed interface built with Tailwind CSS.
- **Dual-Panel Layout:** A responsive design featuring a history sidebar and a main generation panel for an efficient workflow.
- **AI Image Generation Flow (Mock):**
  - Prompt input field.
  - "Generate" button with realistic loading states.
  - Display area for generated images (currently using placeholder data).
- **History & Gallery (Mock):**
  - Sidebar displaying thumbnails of past generations (using mock data).
  - Click-to-select functionality to re-populate the main panel with a previous prompt and image.
- **Mock Authentication:** Simulated user login and logout to test UI states and protected views.

## 🛠️ Tech Stack

- **Frontend:**
  - [Next.js 14](https://nextjs.org/) (App Router)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [React Context API](https://react.dev/learn/passing-data-deeply-with-context) (for state management)
- **Backend (Upcoming in Phase 2 & 3):**
  - AWS Lambda (Python)
  - Amazon API Gateway
  - Amazon DynamoDB
  - Amazon S3
  - Amazon Cognito
  - Amazon Bedrock (AI Model)

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts.
  - `page.tsx`: The main homepage, integrating the sidebar and main panel.
  - `layout.tsx`: Root layout including global providers (AuthContext) and styles.
  - `globals.css`: Global styles and Tailwind directives.
- `components/`: Reusable UI components.
  - `Layout.tsx`: The main two-column application layout.
  - `MainGeneratorPanel.tsx`: The core component for image generation input and display.
  - `GallerySidebar.tsx`: The sidebar component for displaying history thumbnails.
  - `AuthPlaceholder.tsx`: Temporary component for simulating login/logout.
- `context/`: React Context definitions.
  - `AuthContext.tsx`: Provides authentication state to the application.

## ⚡ Getting Started (Run locally with mock data)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/fouz0062/creative-ai-generator.git
    cd ziagen
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📅 Upcoming Phases

- **Phase 2: Cloud Foundation & Authentication:** Set up AWS Cognito for real user auth and define core AWS resources (DynamoDB, S3) using Infrastructure as Code (IaC).
- **Phase 3: Backend API Development:** Build serverless Lambda functions to interact with Amazon Bedrock for real image generation and integrate them with the frontend.
- **Phase 4: CI/CD & Final Polish:** Automate deployment and perform final testing.
