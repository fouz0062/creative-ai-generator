// bin/cdk.ts
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoStack } from '../lib/cognito-stack'; // Import from infra
import { DataStack } from '../lib/data-stack';       // Import from infra
import { StorageStack } from '../lib/storage-stack';   // Import from lib
import { ApiStack } from '../lib/api-stack';
require('source-map-support').install();// Import from lib

const app = new cdk.App();

// Define a common environment for all stacks
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// --- Instantiate all your Stacks here ---

// Phase 2 Stacks: Data and Cognito
const dataStack = new DataStack(app, 'ZiaGenDataStack', { env });
const cognitoStack = new CognitoStack(app, 'ZiaGenCognitoStack', { env });

// Phase 3 Stacks: Storage and API
const storageStack = new StorageStack(app, 'ZiaGenStorageStack', { env }); // Re-using `env`

const apiStack = new ApiStack(app, 'ZiaGenApiStack', {
  // Pass the resources from StorageStack to ApiStack
  imageBucket: storageStack.imageBucket,
  imagesTable: storageStack.imagesTable,
  env: env, // Re-using `env`
});

// Explicitly define dependencies to ensure correct deployment order
apiStack.addDependency(storageStack);
apiStack.addDependency(dataStack); // If API needs outputs from DataStack later
apiStack.addDependency(cognitoStack); // If API needs outputs from CognitoStack later

app.synth(); // Final synthesis