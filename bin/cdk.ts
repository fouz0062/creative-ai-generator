// bin/cdk.ts
// Use the EXACT import path suggested by the error (ensuring source-map-support loads correctly)
import 'E:/aws/creative-ai-generator/node_modules/@cspotcode/source-map-support/register.js'; 

import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
// import { ApiStack } from '../lib/api-stack'; // Not used - using Vercel for APIs instead
import { CognitoStack } from '../lib/cognito-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

// Define constants for your stack names
const DATA_STACK_NAME = 'ZiaGenDataStack';
// const API_STACK_NAME = 'ZiaGenApiStack'; // Not used - using Vercel for APIs instead
const COGNITO_STACK_NAME = 'ZiaGenCognitoStack';

// Retrieve values from environment variables
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;
const AWS_REGION = process.env.AWS_REGION || 'eu-central-1'; // Default to eu-central-1 if not set

// Basic validation (optional but good practice)
if (!AWS_ACCOUNT_ID) {
  throw new Error('AWS_ACCOUNT_ID not found in .env file or environment variables.');
}

// 1. Data Stack (S3, DynamoDB)
const dataStack = new DataStack(app, DATA_STACK_NAME, {
  env: {
    account: AWS_ACCOUNT_ID,
    region: AWS_REGION,
  },
});

// 2. Cognito Stack (User Auth)
const cognitoStack = new CognitoStack(app, COGNITO_STACK_NAME, {
  env: {
    account: AWS_ACCOUNT_ID,
    region: AWS_REGION,
  },
});

// Note: dataStack and cognitoStack are used implicitly by CDK (registering with app)
// The linter doesn't detect this, so we explicitly reference them to satisfy ESLint
void dataStack;
void cognitoStack;

// 3. API Stack (Lambda, API Gateway) - NOT DEPLOYED
// Using Vercel for API routes instead of AWS Lambda + API Gateway
// To use AWS Lambda instead, uncomment below and deploy:
/*
const apiStack = new ApiStack(app, API_STACK_NAME, {
  imagesTable: dataStack.imagesTable,
  imageBucket: dataStack.imageBucket,
  userPool: cognitoStack.userPool,
  userPoolClient: cognitoStack.userPoolClient,
  env: {
    account: AWS_ACCOUNT_ID,
    region: AWS_REGION,
  },
});
*/

app.synth();