# 🎨 ZiaGen - AI Image Generator

> **Transform your imagination into stunning visuals with the power of AI - completely free!**

ZiaGen is a modern, fully-featured AI image generation platform that brings your creative ideas to life. Built with cutting-edge web technologies and powered by free AI services, ZiaGen makes professional image generation accessible to everyone.

---

## ✨ Features

### 🖼️ **Powerful Image Generation**

- **Multiple Artistic Styles**: Choose from 12+ styles including Studio Ghibli, Cartoon, Pixel Art, Realistic, Oil Painting, Watercolor, Cyberpunk, Fantasy, and more!
- **Custom Dimensions**: Generate images in various sizes - Square (512px to 1024px), Portrait, Landscape, or Wide formats
- **Instant Results**: Fast image generation with visual loading states

### 🎯 **Intuitive User Experience**

- **Beautiful Dark UI**: Sleek interface with purple/violet gradient accents and glowing effects
- **Fully Responsive**: Perfect experience on desktop, tablet, and mobile devices
- **Image Gallery**: Browse all your creations with thumbnails and quick selection
- **Easy Management**: Delete unwanted images with a single click
- **Download Feature**: Download any generated image with one click

### 🔐 **Secure Authentication**

- **AWS Cognito Integration**: Enterprise-grade user authentication
- **Email Verification**: Secure account creation with confirmation codes
- **Password Recovery**: Easy password reset flow
- **Protected Access**: Your images are private and secure

### 💾 **Cloud Storage**

- **Amazon S3**: All generated images are stored in the cloud
- **Metadata Tracking**: Each image saves its prompt and settings
- **Persistent Gallery**: Access your images anytime, anywhere

---

## 🚀 Tech Stack

### **Frontend**

- ⚛️ **Next.js 16** (App Router) - React framework for production
- 📘 **TypeScript** - Type-safe development
- 🎨 **Tailwind CSS** - Utility-first styling
- 🖼️ **Next/Image** - Optimized image loading
- 🔄 **React Context** - State management

### **Backend & Infrastructure**

- 🚀 **Vercel Serverless** - API routes hosting (Next.js API routes)
- ☁️ **AWS S3** - Cloud image storage (managed via CDK)
- 🔐 **AWS Cognito** - User authentication (managed via CDK)
- 🏗️ **AWS CDK** - Infrastructure as Code (manages S3 & Cognito)
- 🎨 **Pollinations.ai** - Free AI image generation
- 📦 **AWS SDK** - S3 operations

### **AI & APIs**

- 🤖 **Pollinations.ai** - Free, unlimited AI image generation
- 🎭 **12+ Art Styles** - From anime to photorealistic
- 📐 **8 Dimension Presets** - Flexible image sizing

### **⚡ Serverless Architecture**

**AWS Services Used (Managed via CDK):**

1. ✅ **AWS Cognito** - User authentication (sign up, sign in, email verification)
2. ✅ **Amazon S3** - Image storage bucket (stores all generated images)

**AWS Services NOT Used:**

- ❌ **API Gateway** - Not needed (using Vercel for APIs)
- ❌ **AWS Lambda** - Not needed (using Vercel Serverless Functions)

**Why Vercel Instead of AWS Lambda + API Gateway?**

Your Next.js API routes (in `app/api/`) run on **Vercel's edge network** instead of AWS Lambda:

- 🚀 **Optimized for Next.js**: Zero configuration, instant deployments
- 💰 **Cost-Effective**: Generous free tier with no hidden costs
- ⚡ **No Cold Starts**: Instant response times (Lambda has cold starts)
- 🌍 **Global CDN**: Edge functions deployed worldwide automatically
- 🔄 **Auto Deploy**: Push to Git = automatic deployment
- 📊 **Built-in Analytics**: Monitor performance and errors

**Deploy Your AWS Infrastructure:**

```bash
# Deploy S3 and Cognito via CDK (API Gateway/Lambda not needed)
cdk deploy ZiaGenDataStack ZiaGenCognitoStack
```

**What This Means:**

- Your **frontend** and **API routes** run on **Vercel** (free, fast, optimized)
- Your **authentication** and **storage** run on **AWS** (managed via CDK)
- This hybrid approach gives you the best of both worlds!

---

## 📂 Project Structure

```
creative-ai-generator/
├── app/                         # Next.js App Router
│   ├── api/                     # ✅ Vercel Serverless API Routes
│   │   ├── generate-hf/         # Image generation endpoint
│   │   ├── list-images/         # Gallery listing endpoint
│   │   └── delete-image/        # Image deletion endpoint
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Main application page
│   └── globals.css              # Global styles
├── components/                  # React components
│   ├── MainGeneratorPanel.tsx   # Image generation UI
│   ├── GallerySidebar.tsx       # Image gallery & navigation
│   ├── AuthPlaceholder.tsx      # Authentication forms
│   ├── Layout.tsx               # App layout wrapper
│   └── AmplifyConfigProvider.tsx # AWS Amplify setup
├── context/                     # React Context
│   └── AuthContext.tsx          # Authentication state
├── lib/                         # AWS CDK Infrastructure (IaC)
│   ├── amplify-config.ts        # Amplify configuration
│   ├── data-stack.ts            # ✅ S3 & DynamoDB stack (deployed)
│   ├── cognito-stack.ts         # ✅ User authentication (deployed)
│   └── api-stack.ts             # ⚠️ API Gateway & Lambda (not deployed)
├── bin/                         # CDK app entry point
│   └── cdk.ts                   # CDK application
└── webArchitecture/             # Architecture documentation
    ├── architecture-diagram.html # Interactive diagram
    ├── ARCHITECTURE.md           # Detailed markdown docs
    └── ARCHITECTURE-SIMPLE.txt   # Simple text diagram
```

---

## 🎯 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- AWS Account (for authentication and storage)
- AWS CLI configured with your credentials

### **1. Clone the Repository**

```bash
git clone https://github.com/fouz0062/creative-ai-generator.git
cd creative-ai-generator
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Configure Environment Variables**

Create a `.env.local` file in the root directory:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name

# Cognito Configuration
NEXT_PUBLIC_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your_client_id
NEXT_PUBLIC_API_REGION=us-east-1

# API Gateway (for legacy Lambda functions)
NEXT_PUBLIC_API_URL=your_api_gateway_url
```

### **4. Deploy AWS Infrastructure**

```bash
# Bootstrap CDK (first time only)
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1

# Deploy all stacks
cdk deploy --all
```

### **5. Run the Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and start creating! 🎨

---

## 🎨 How to Use

### **Create Your First Image**

1. **Sign Up / Sign In** - Create an account or log in
2. **Choose Your Style** - Select from 12+ artistic styles
3. **Pick Dimensions** - Choose your preferred image size
4. **Enter Your Prompt** - Describe what you want to see
5. **Click Generate** - Watch your idea come to life!

### **Manage Your Gallery**

- **View All Images** - Browse your creations in the sidebar
- **Regenerate** - Click any image to modify and regenerate it
- **Delete** - Remove images you no longer want
- **Refresh** - Update the gallery to see new images

### **Available Styles**

- 🎌 **Studio Ghibli / Anime** - Soft, hand-drawn animation style
- 🎭 **Cartoon / Comic** - Bold outlines and vibrant colors
- 🕹️ **Pixel Art** - Retro 8-bit gaming aesthetic
- 📸 **Photorealistic** - Professional photography quality
- 🖌️ **Oil Painting** - Classical art with textured brushstrokes
- 🎨 **Watercolor** - Soft, artistic washes
- 💻 **Digital Art** - Modern illustration style
- 🌃 **Cyberpunk** - Neon-lit futuristic aesthetic
- 🧙 **Fantasy Art** - Magical and ethereal visuals
- ⬜ **Minimalist** - Clean, simple compositions
- 🎮 **3D Render** - High-quality CGI style
- ✨ **Default** - Let the AI decide!

---

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# AWS CDK Commands
cdk deploy --all     # Deploy all stacks
cdk destroy --all    # Remove all stacks
cdk synth            # Synthesize CloudFormation template
cdk diff             # Show changes
```

### **Environment Variables**

All environment variables should be defined in `.env.local`:

| Variable                          | Description                     | Required    |
| --------------------------------- | ------------------------------- | ----------- |
| `AWS_ACCESS_KEY_ID`               | Your AWS access key             | ✅ Yes      |
| `AWS_SECRET_ACCESS_KEY`           | Your AWS secret key             | ✅ Yes      |
| `AWS_REGION`                      | AWS region (default: us-east-1) | ✅ Yes      |
| `S3_BUCKET_NAME`                  | S3 bucket for image storage     | ✅ Yes      |
| `NEXT_PUBLIC_USER_POOL_ID`        | Cognito User Pool ID            | ✅ Yes      |
| `NEXT_PUBLIC_USER_POOL_CLIENT_ID` | Cognito App Client ID           | ✅ Yes      |
| `NEXT_PUBLIC_API_URL`             | API Gateway URL                 | ⚠️ Optional |

---

## 🌟 Why ZiaGen?

### **100% Free**

- No API costs for image generation
- Unlimited generations with Pollinations.ai
- Only pay for AWS storage (pennies per month)

### **Professional Quality**

- Multiple artistic styles
- Customizable dimensions
- High-quality output

### **Modern Architecture**

- Server-side rendering with Next.js
- Serverless AWS infrastructure
- Type-safe TypeScript codebase
- Responsive design

### **Privacy & Security**

- Secure authentication
- Private image storage
- No data sharing
- Your creations are yours alone

---

## 📸 Screenshots

- **Main Generator**: Beautiful dark UI with gradient accents
- **Style Selector**: 12+ artistic styles at your fingertips
- **Gallery View**: Easy browsing and management
- **Responsive Design**: Perfect on any device

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests
- ⭐ Star the repository

---

## 📄 License

This project is licensed under the MIT License.

---

## 🎉 Credits

Built with ❤️ using:

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Pollinations.ai](https://pollinations.ai/)

---

**Ready to create amazing images? Get started now! 🚀**
