// lib/cognito-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';

// Define the properties for your CognitoStack
export interface CognitoStackProps extends cdk.StackProps {
  api: HttpApi; // Required: Expects an HttpApi object
}

export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  // CHANGED: props is now required (removed '?')
  constructor(scope: Construct, id: string, props: CognitoStackProps) { 
    super(scope, id, props);

    // 1. Define the Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'ZiaGenUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      userPoolName: 'ZiaGenUserPool',
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 2. Define the Cognito App Client
    this.userPoolClient = this.userPool.addClient('ZiaGenAppClient', {
      authFlows: {
        userSrp: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO
      ]
    });

    // CDK Outputs (important for connecting the frontend later)
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
    });
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
    });
  }
}