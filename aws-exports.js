// src/aws-exports.js (or aws-exports.js in root)

const awsmobile = {
  // REQUIRED: The AWS Region where your Cognito User Pool and API Gateway are deployed
  aws_project_region: "YOUR_AWS_REGION", // e.g., "us-east-1"

  // --- Cognito Configuration ---
  aws_user_pools_id: "YOUR_USER_POOL_ID", // e.g., "us-east-1_XXXXX"
  aws_user_pools_web_client_id: "YOUR_USER_POOL_CLIENT_ID", // e.g., "YYYYYYYYY"
  aws_cognito_identity_pool_id: "YOUR_IDENTITY_POOL_ID", // Optional, if using Identity Pool for unauthenticated access, otherwise remove or leave empty string
  aws_cognito_region: "YOUR_AWS_REGION", // Should be the same as aws_project_region
  aws_mandatory_sign_in: "enable", // Requires users to be signed in to access certain parts

  // --- API Gateway Configuration ---
  aws_cloud_logic_custom: [
    {
      name: "ImageGenerationApi", // This is the logical name for your API in Amplify
      endpoint: "YOUR_API_URL", // e.g., "https://abcdefghij.execute-api.us-east-1.amazonaws.com/"
      region: "YOUR_AWS_REGION",
      authorizationType: "AMAZON_COGNITO_USER_POOLS", // We will update this later once we integrate with cognito
    },
  ],

  // --- S3 Storage Configuration ---
  aws_user_files_s3_bucket: "YOUR_IMAGE_BUCKET_NAME", // e.g., "ziagenstoragestack-imagestoragebucket12345-abcdefghijk"
  aws_user_files_s3_bucket_region: "YOUR_AWS_REGION",
};

export default awsmobile;
