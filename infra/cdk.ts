// infra/cdk.ts
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoStack } from './cognito-stack';
import { DataStack } from './data-stack';

const app = new cdk.App();

// Define a common environment for all stacks
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// 1. Create the Data Stack (S3 and DynamoDB)
const dataStack = new DataStack(app, 'ZiaGenDataStack', { env });

// 2. Create the Cognito Stack (Authentication)
const cognitoStack = new CognitoStack(app, 'ZiaGenCognitoStack', { env });

// We can pass outputs from one stack to another if needed (e.g., passing the User Pool ID to the API Stack later)

app.synth();