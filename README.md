# ZiaGen - Creative AI Image Generator

**ZiaGen** is a cutting-edge, serverless generative AI application that allows users to create stunning images from text prompts. Built with a modern Next.js frontend and powered by AWS cloud services, ZiaGen offers a seamless and powerful creative experience.

## 🚀 Project Status

**Current Phase: Core Backend API Complete & Functioning**

We have successfully deployed and configured the complete backend infrastructure, including core data storage (S3 & DynamoDB), user authentication (Cognito), and the **fully functional image generation API** integrated with Amazon Bedrock. The frontend UI with mock data is also complete.

## ✨ Key Features (Currently Implemented)

### Frontend (Complete - Next.js UI & Mock Data)

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

### Backend (Deployed & Functional to AWS)

- **Amazon DynamoDB:** Table (`ZiaGenImages`) for storing image metadata.
- **Amazon S3:** Bucket (`ZiaGenImageBucket`) for storing generated images.
- **Amazon Cognito:** User Pool (`ZiaGenUserPool`) and App Client (`ZiaGenAppClient`) for user authentication.
- **Amazon API Gateway:** HTTP API (`ImageGenerationApi`) with a `POST /generate` endpoint.
- **AWS Lambda:**
  - **`GenerateImageHandler`:** Fully implemented and integrated with API Gateway.
  - **Seamless Bedrock Integration:** Successfully invokes **Amazon Titan Image Generator v1** in `us-east-1` to create images from prompts.
  - **Image Persistence:** Stores generated images in S3 and their metadata (including `imageUrl`) in DynamoDB.
- **Infrastructure as Code (IaC):** All backend resources (Data, API, Cognito) are defined and deployed using AWS CDK (TypeScript) in `us-east-1`.

## 🛠️ Tech Stack

- **Frontend:**
  - [Next.js 14](https://nextjs.org/) (App Router)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [React Context API](https://react.dev/learn/passing-data-deeply-with-context) (for state management)
- **Backend:**
  - AWS CDK (TypeScript)
  - AWS Lambda (Node.js)
  - Amazon API Gateway
  - Amazon DynamoDB
  - Amazon S3
  - Amazon Cognito
  - **Amazon Bedrock (AI Model - Amazon Titan Image Generator v1)**

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
- `bin/`: AWS CDK application entry point.
- `lib/`: AWS CDK stack definitions (e.g., `data-stack.ts`, `api-stack.ts`, `cognito-stack.ts`).
- `lambda/`: Lambda function source code (e.g., `generateImage.ts`).
- `.env`: Environment variables for AWS Account ID and Region (local only, excluded from Git).

## ⚡ Getting Started (Run Locally)

### Frontend (with mock data)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/fouz0062/creative-ai-generator.git](https://github.com/fouz0062/creative-ai-generator.git)
    cd creative-ai-generator
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

### Backend (Deployed Infrastructure)

1.  **Prerequisites:**
    - [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configured with your AWS credentials.
    - [Node.js](https://nodejs.org/) (LTS recommended).
    - [AWS CDK CLI](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_install) installed globally (`npm install -g aws-cdk`).
2.  **Navigate to the project root:**
    ```bash
    cd creative-ai-generator
    ```
3.  **Install backend dependencies:**
    ```bash
    npm install
    ```
4.  **Create a `.env` file** in the project root with your AWS Account ID and Region:
    ```
    # .env
    AWS_ACCOUNT_ID=YOUR_AWS_ACCOUNT_ID
    AWS_REGION=us-east-1 # Bedrock deployment region for Titan Image Generator
    ```
    _(Remember to replace `YOUR_AWS_ACCOUNT_ID` with your actual 12-digit AWS Account ID.)_
5.  **Bootstrap CDK (if not already done):**
    ```bash
    cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/us-east-1
    ```
6.  **Deploy the backend infrastructure:**
    ```bash
    cdk deploy --all
    ```
    _(Confirm any IAM or security changes by typing `y` if prompted, or use `--require-approval never` for non-interactive deployment.)_
7.  **Verify Bedrock Model Access:** Ensure `Amazon Titan Image Generator v1` has "Access granted" in the Bedrock console in the `US East (N. Virginia) us-east-1` region.
8.  **Test the API Endpoint:**
    - **Method:** `POST`
    - **URL:** (Find in CDK deploy output, e.g., `https://jiclxodrh6.execute-api.us-east-1.amazonaws.com/`) Append `/generate` to it.
    - **Headers:** `Content-Type: application/json`
    - **Body (JSON):** `{"prompt": "A majestic lion wearing a crown, in a vibrant jungle, digital painting"}`
    - Expected: `200 OK` with `imageUrl` in the response.

## 📅 Upcoming Phases

- **Phase 2: Frontend Integration with Real Backend:** Connect the Next.js frontend to the deployed AWS Cognito for authentication and the API Gateway for real image generation. Display actual generated images from S3.
- **Phase 3: CI/CD & Final Polish:** Automate deployment for both frontend and backend, perform comprehensive testing, and enhance user experience.
