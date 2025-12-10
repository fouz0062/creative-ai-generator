import { Amplify } from 'aws-amplify';

// Load configuration from environment variables
const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const region = process.env.NEXT_PUBLIC_API_REGION || 'us-east-1';

// Validate required environment variables
if (!userPoolId || !userPoolClientId || !apiUrl) {
  throw new Error(
    'Missing required environment variables. Please check your .env file:\n' +
    `NEXT_PUBLIC_USER_POOL_ID: ${userPoolId ? '✓' : '✗'}\n` +
    `NEXT_PUBLIC_USER_POOL_CLIENT_ID: ${userPoolClientId ? '✓' : '✗'}\n` +
    `NEXT_PUBLIC_API_URL: ${apiUrl ? '✓' : '✗'}`
  );
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
      loginWith: {
        email: true,
      },
    },
  },
  API: {
    REST: {
      'ImageGenerationApi': {
        endpoint: apiUrl,
        region: region,
        // Tell Amplify to automatically attach the JWT token
        routes: {
          '/generate': {
            authorizationType: 'Bearer'
          }
        },
      },
    },
  },
});

export { Amplify };
