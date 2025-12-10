# Lambda Functions (Reference)

> ⚠️ **Note**: These Lambda functions are kept for **reference purposes only**.  
> The current deployment uses **Vercel Serverless Functions** (Next.js API routes) instead of AWS Lambda + API Gateway.

## 📁 Directory Structure

```
lambda/
├── generateImage/
│   ├── index.mjs          # Generate images using Amazon Bedrock
│   └── package.json
├── listImages/
│   ├── index.mjs          # List user's images from S3
│   └── package.json
├── deleteImage/
│   ├── index.mjs          # Delete images from S3
│   └── package.json
└── README.md              # This file
```

## 🔄 Current vs. Reference Architecture

### ✅ **Current Architecture (Vercel)**

```
User → Vercel Edge Network → Next.js API Routes → AWS S3/Cognito
```

- **Backend**: Next.js API routes (`app/api/*/route.ts`)
- **Hosting**: Vercel Serverless Functions
- **Benefits**: No cold starts, auto-scaling, simpler deployment

### 📚 **Reference Architecture (AWS Lambda)**

```
User → CloudFront → API Gateway → Lambda Functions → S3/Cognito
```

- **Backend**: AWS Lambda functions (this folder)
- **Hosting**: AWS Lambda + API Gateway
- **Benefits**: Full AWS ecosystem, fine-grained control

## 🚀 If You Want to Use Lambda Functions

If you decide to switch to AWS Lambda in the future, here's how:

### 1. **Uncomment API Stack in CDK**

Edit `bin/cdk.ts`:

```typescript
// Uncomment this:
import { ApiStack } from "../lib/api-stack";

const apiStack = new ApiStack(app, "ZiaGenApiStack", {
  env: { account, region },
  bucket: dataStack.bucket,
  userPool: cognitoStack.userPool,
  userPoolClient: cognitoStack.userPoolClient,
});
```

### 2. **Deploy Lambda Functions**

```bash
# Install dependencies for each Lambda
cd lambda/generateImage && npm install && cd ../..
cd lambda/listImages && npm install && cd ../..
cd lambda/deleteImage && npm install && cd ../..

# Deploy API Stack
cdk deploy ZiaGenApiStack
```

### 3. **Update Frontend**

Change `NEXT_PUBLIC_API_URL` in `.env.local` to your API Gateway URL:

```env
NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### 4. **Update Next.js API Routes**

You can either:

- **Option A**: Keep Next.js API routes as proxies to Lambda
- **Option B**: Call API Gateway directly from frontend components

## 📝 Function Details

### `generateImage/index.mjs`

- **Purpose**: Generate images using Amazon Bedrock (Titan Image Generator)
- **Method**: POST
- **Input**: `{ prompt, style, dimensions, s3Key? }`
- **Output**: `{ imageUrl, s3Key, prompt, style, dimensions }`
- **Features**:
  - Supports style and dimension customization
  - Saves to S3 with metadata
  - Supports image regeneration (overwrites existing)

### `listImages/index.mjs`

- **Purpose**: List all images for the authenticated user
- **Method**: GET
- **Input**: None (uses Cognito user ID from authorizer)
- **Output**: `{ images: [...] }`
- **Features**:
  - Fetches images from user-specific S3 prefix
  - Retrieves metadata (prompt, style, dimensions)
  - Sorts by creation date (newest first)

### `deleteImage/index.mjs`

- **Purpose**: Delete a specific image from S3
- **Method**: DELETE
- **Input**: `s3Key` (query parameter)
- **Output**: `{ success: true }`
- **Features**:
  - Security: Verifies user owns the image
  - Prevents unauthorized deletions

## 🔐 Security Notes

- All Lambda functions expect **Cognito JWT tokens** via API Gateway authorizer
- User ID is extracted from token claims: `event.requestContext.authorizer.claims.sub`
- S3 keys are prefixed with user ID to ensure data isolation
- Delete function validates ownership before deletion

## 💰 Cost Comparison

| Service          | Vercel (Current) | AWS Lambda (Reference)  |
| ---------------- | ---------------- | ----------------------- |
| **Monthly Cost** | $0 (Hobby Plan)  | ~$0-5 (pay-per-request) |
| **Cold Starts**  | Minimal          | 100-500ms               |
| **Scaling**      | Automatic        | Automatic               |
| **Maintenance**  | Low              | Medium                  |
| **Control**      | Limited          | Full                    |

## 🎯 When to Use Lambda

Consider switching to Lambda if you need:

- ✅ Full AWS ecosystem integration
- ✅ VPC access for private resources
- ✅ Custom runtime or container images
- ✅ Function-level IAM policies
- ✅ Step Functions orchestration
- ✅ More than 10s execution time (Vercel limit)

## 📞 Support

For questions about:

- **Current setup (Vercel)**: Check `app/api/*/route.ts`
- **Lambda setup**: Check this folder and `lib/api-stack.ts`
- **CDK deployment**: Check `lib/` and `bin/cdk.ts`

---

**Last Updated**: December 2025  
**Status**: Reference Only (Not Deployed)
