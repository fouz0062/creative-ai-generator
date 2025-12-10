# 🏗️ ZiaGen Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        A1[Mobile Device]
    end

    subgraph "Frontend - Next.js 16"
        B[Next.js App]
        B1[MainGeneratorPanel]
        B2[GallerySidebar]
        B3[AuthPlaceholder]
        B4[React Context - Auth]
    end

    subgraph "API Routes"
        C1[/api/generate-hf]
        C2[/api/list-images]
        C3[/api/delete-image]
    end

    subgraph "AWS Services"
        D1[Amazon Cognito]
        D2[Amazon S3]
        D3[API Gateway - Optional]
        D4[Lambda Functions - Optional]
    end

    subgraph "External APIs"
        E1[Pollinations.ai - Free AI]
    end

    A --> B
    A1 --> B
    B --> B1
    B --> B2
    B --> B3
    B --> B4

    B1 --> C1
    B2 --> C2
    B2 --> C3
    B3 --> D1
    B4 --> D1

    C1 --> E1
    C1 --> D2
    C2 --> D2
    C3 --> D2

    style A fill:#4338ca,stroke:#333,stroke-width:2px,color:#fff
    style A1 fill:#4338ca,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#8b5cf6,stroke:#333,stroke-width:2px,color:#fff
    style C1 fill:#06b6d4,stroke:#333,stroke-width:2px,color:#fff
    style C2 fill:#06b6d4,stroke:#333,stroke-width:2px,color:#fff
    style C3 fill:#06b6d4,stroke:#333,stroke-width:2px,color:#fff
    style D1 fill:#f59e0b,stroke:#333,stroke-width:2px,color:#fff
    style D2 fill:#f59e0b,stroke:#333,stroke-width:2px,color:#fff
    style E1 fill:#10b981,stroke:#333,stroke-width:2px,color:#fff
```

---

## 📊 Detailed Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Next.js UI
    participant Auth as AWS Cognito
    participant API as API Routes
    participant AI as Pollinations.ai
    participant S3 as Amazon S3

    Note over U,S3: 1. Authentication Flow
    U->>UI: Sign Up / Sign In
    UI->>Auth: Authenticate User
    Auth-->>UI: Return JWT Token
    UI-->>U: Access Granted

    Note over U,S3: 2. Image Generation Flow
    U->>UI: Enter Prompt + Style + Dimensions
    UI->>API: POST /api/generate-hf
    API->>AI: Request Image Generation
    AI-->>API: Return Generated Image (PNG)
    API->>S3: Upload Image with Metadata
    S3-->>API: Confirm Upload + S3 URL
    API-->>UI: Return Image URL
    UI-->>U: Display Generated Image

    Note over U,S3: 3. Gallery & Management Flow
    U->>UI: View Gallery
    UI->>API: GET /api/list-images
    API->>S3: List Objects + Metadata
    S3-->>API: Return Image List
    API-->>UI: Return Image Array
    UI-->>U: Display Gallery

    Note over U,S3: 4. Delete Image Flow
    U->>UI: Delete Image
    UI->>API: DELETE /api/delete-image
    API->>S3: Delete Object
    S3-->>API: Confirm Deletion
    API-->>UI: Success Response
    UI-->>U: Update Gallery
```

---

## 🔄 Component Architecture

```mermaid
graph LR
    subgraph "App Layout"
        L[Layout Component]
    end

    subgraph "Authentication"
        AP[AmplifyConfigProvider]
        AC[AuthContext Provider]
        PH[AuthPlaceholder]
    end

    subgraph "Main Application"
        MP[MainGeneratorPanel]
        GS[GallerySidebar]
    end

    L --> AP
    AP --> AC
    AC --> PH
    AC --> MP
    AC --> GS

    MP -.->|onImageGenerated| GS
    GS -.->|onSelectImage| MP

    style L fill:#1e293b,stroke:#333,stroke-width:2px,color:#fff
    style AP fill:#4338ca,stroke:#333,stroke-width:2px,color:#fff
    style AC fill:#4338ca,stroke:#333,stroke-width:2px,color:#fff
    style PH fill:#8b5cf6,stroke:#333,stroke-width:2px,color:#fff
    style MP fill:#8b5cf6,stroke:#333,stroke-width:2px,color:#fff
    style GS fill:#8b5cf6,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🗄️ Data Storage Structure

```mermaid
graph TB
    subgraph "Amazon S3 Bucket"
        S3[ziagendatastack-ziagenimagebucket]
        S3F[generated-images/]
        IMG1[1234567890.png]
        IMG2[1234567891.png]
        META1[Metadata: prompt, style, dimensions]
        META2[Metadata: prompt, style, dimensions]
    end

    S3 --> S3F
    S3F --> IMG1
    S3F --> IMG2
    IMG1 --> META1
    IMG2 --> META2

    style S3 fill:#f59e0b,stroke:#333,stroke-width:2px,color:#fff
    style S3F fill:#fbbf24,stroke:#333,stroke-width:2px,color:#000
    style IMG1 fill:#06b6d4,stroke:#333,stroke-width:2px,color:#fff
    style IMG2 fill:#06b6d4,stroke:#333,stroke-width:2px,color:#fff
    style META1 fill:#94a3b8,stroke:#333,stroke-width:2px,color:#000
    style META2 fill:#94a3b8,stroke:#333,stroke-width:2px,color:#000
```

---

## 🎨 Feature Flow Map

```mermaid
graph TD
    START[User Lands on App]
    AUTH{Authenticated?}
    LOGIN[Login/Signup Form]
    MAIN[Main Generator Panel]

    STYLE[Select Image Style - 12 Options]
    DIM[Select Dimensions - 8 Sizes]
    PROMPT[Enter Text Prompt]
    GEN[Click Generate/Regenerate]

    WAIT[Processing - 30s max]
    DISPLAY[Display Generated Image]
    SAVE[Auto-Save to S3]
    GALLERY[Add to Gallery]

    ACTIONS{User Action?}
    REGEN[Regenerate - Same ID]
    NEW[Create New Image]
    DELETE[Delete Image]
    VIEW[View in Gallery]

    START --> AUTH
    AUTH -->|No| LOGIN
    AUTH -->|Yes| MAIN
    LOGIN --> MAIN

    MAIN --> STYLE
    STYLE --> DIM
    DIM --> PROMPT
    PROMPT --> GEN

    GEN --> WAIT
    WAIT --> DISPLAY
    DISPLAY --> SAVE
    SAVE --> GALLERY

    GALLERY --> ACTIONS
    ACTIONS --> REGEN
    ACTIONS --> NEW
    ACTIONS --> DELETE
    ACTIONS --> VIEW

    REGEN --> STYLE
    NEW --> MAIN
    DELETE --> GALLERY
    VIEW --> DISPLAY

    style START fill:#4338ca,stroke:#333,stroke-width:2px,color:#fff
    style MAIN fill:#8b5cf6,stroke:#333,stroke-width:2px,color:#fff
    style GEN fill:#10b981,stroke:#333,stroke-width:2px,color:#fff
    style SAVE fill:#f59e0b,stroke:#333,stroke-width:2px,color:#fff
    style GALLERY fill:#06b6d4,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🔐 Security Architecture

```mermaid
graph LR
    subgraph "Public Access"
        PUB[Public Internet]
    end

    subgraph "Application Layer"
        APP[Next.js App - Vercel]
        API[API Routes]
    end

    subgraph "Authentication Layer"
        COG[AWS Cognito]
        JWT[JWT Tokens]
    end

    subgraph "Storage Layer - Secured"
        S3[Amazon S3 - Private Bucket]
    end

    subgraph "External Services"
        POLL[Pollinations.ai - Public API]
    end

    PUB -->|HTTPS| APP
    APP -->|Auth Request| COG
    COG -->|JWT Token| APP
    APP -->|Authenticated| API
    API -->|With Credentials| S3
    API -->|Generate Image| POLL
    POLL -->|PNG Image| API
    API -->|Upload| S3

    style COG fill:#dc2626,stroke:#333,stroke-width:3px,color:#fff
    style JWT fill:#dc2626,stroke:#333,stroke-width:2px,color:#fff
    style S3 fill:#dc2626,stroke:#333,stroke-width:3px,color:#fff
    style APP fill:#10b981,stroke:#333,stroke-width:2px,color:#fff
```

---

## 💰 Cost Breakdown

| Service                | Usage                      | Cost                   |
| ---------------------- | -------------------------- | ---------------------- |
| **Pollinations.ai**    | Unlimited image generation | **$0.00** (Free!)      |
| **Vercel Hosting**     | 100GB bandwidth/month      | **$0.00** (Free tier)  |
| **AWS Cognito**        | Up to 50,000 MAU           | **$0.00** (Free tier)  |
| **AWS S3**             | Storage + requests         | **~$0.01-$1/month**    |
| **AWS API Gateway**    | Optional, minimal usage    | **~$0.00-$0.50/month** |
| **Total Monthly Cost** |                            | **~$0.01-$2.00** ✨    |

---

## 📈 Scalability

```mermaid
graph TB
    subgraph "Current State - Supports 1000s of users"
        C1[Vercel Edge Network]
        C2[Global CDN]
        C3[AWS S3 - 99.99% uptime]
        C4[Pollinations.ai - Unlimited]
    end

    subgraph "Future Scaling Options"
        F1[Add CloudFront CDN]
        F2[DynamoDB for metadata]
        F3[Lambda for background jobs]
        F4[Multi-region deployment]
    end

    C1 --> F1
    C2 --> F1
    C3 --> F2
    C4 --> F3

    style C1 fill:#10b981,stroke:#333,stroke-width:2px,color:#fff
    style C2 fill:#10b981,stroke:#333,stroke-width:2px,color:#fff
    style C3 fill:#10b981,stroke:#333,stroke-width:2px,color:#fff
    style C4 fill:#10b981,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🎯 Technology Choices

| Component              | Technology      | Why?                                          |
| ---------------------- | --------------- | --------------------------------------------- |
| **Frontend Framework** | Next.js 16      | Best React framework, SSR, great DX           |
| **Styling**            | Tailwind CSS    | Utility-first, responsive, fast development   |
| **Authentication**     | AWS Cognito     | Enterprise-grade, scalable, secure            |
| **Storage**            | Amazon S3       | Reliable, cheap, scalable, global             |
| **AI Generation**      | Pollinations.ai | 100% free, unlimited, no API key needed       |
| **Hosting**            | Vercel          | Optimized for Next.js, free, fast, global CDN |
| **Type Safety**        | TypeScript      | Catch errors early, better DX, maintainable   |

---

**This architecture is built for scale, security, and minimal cost while delivering maximum value!** 🚀
