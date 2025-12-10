// bin/cdk.ts
// Use the EXACT import path suggested by the error (ensuring source-map-support loads correctly)
import 'E:/aws/creative-ai-generator/node_modules/@cspotcode/source-map-support/register.js'; 

import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { ApiStack } from '../lib/api-stack';
import { CognitoStack } from '../lib/cognito-stack';
import * as dotenv from 'dotenv'; // <-- Keep this import

dotenv.config(); // <-- Keep this line to load variables from .env

const app = new cdk.App();

// Define constants for your stack names
const DATA_STACK_NAME = 'ZiaGenDataStack';
const API_STACK_NAME = 'ZiaGenApiStack';
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

// 2. Cognito Stack (User Auth) - MUST BE DEFINED BEFORE API STACK
const cognitoStack = new CognitoStack(app, COGNITO_STACK_NAME, {
  env: {
    account: AWS_ACCOUNT_ID,
    region: AWS_REGION,
  },
});

// 3. API Stack (Lambda, API Gateway) - NOW RECEIVES COGNITO RESOURCES
const apiStack = new ApiStack(app, API_STACK_NAME, {
  imagesTable: dataStack.imagesTable,
  imageBucket: dataStack.imageBucket,
  userPool: cognitoStack.userPool, // <--- NEW: Pass the UserPool object
  userPoolClient: cognitoStack.userPoolClient, // <--- NEW: Pass the AppClient object
  env: {
    account: AWS_ACCOUNT_ID,
    region: AWS_REGION,
  },
});

app.synth();