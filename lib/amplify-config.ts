import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  // Only run in the browser, not during build
  if (typeof window === 'undefined') {
    return;
  }

  // Load configuration from environment variables
  const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
  const region = process.env.NEXT_PUBLIC_API_REGION || 'us-east-1';

  // Validate required environment variables
  if (!userPoolId || !userPoolClientId) {
    console.error(
      'Missing required environment variables. Please check your Vercel environment variables:\n' +
      `NEXT_PUBLIC_USER_POOL_ID: ${userPoolId ? '✓' : '✗'}\n` +
      `NEXT_PUBLIC_USER_POOL_CLIENT_ID: ${userPoolClientId ? '✓' : '✗'}`
    );
    return;
  }

  // Configure Amplify for Cognito authentication only
  // API calls are handled directly by Next.js API routes
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
  });
}

export { Amplify };
