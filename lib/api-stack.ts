// lib/api-stack.ts

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
// Ensure Cors is imported from the alpha module, along with HttpApi and HttpMethod
import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb'; 
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as path from 'path'; // Need path for the entry point

// Define the interface for the ApiStack's props
export interface ApiStackProps extends cdk.StackProps {
  imagesTable: Table; 
  imageBucket: Bucket; 
}

export class ApiStack extends cdk.Stack {
  public readonly apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // 1. Define the Creative Computer (Lambda Function)
    const generateImageLambda = new nodejs.NodejsFunction(this, 'GenerateImageHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      // FIX: Ensure the entry path is correct relative to the cdk.ts file
      entry: path.join(__dirname, '..', 'lambda', 'generateImage.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        DYNAMODB_TABLE_NAME: props.imagesTable.tableName,
        S3_BUCKET_NAME: props.imageBucket.bucketName,
      },
      bundling: {
        externalModules: ['aws-sdk'], // Prevent bundling the AWS SDK
      },
    });

    // 2. Grant Permissions to the Lambda's IAM Role
    props.imagesTable.grantWriteData(generateImageLambda);
    props.imageBucket.grantWrite(generateImageLambda);

    // 3. Define the HTTP API Gateway
    const httpApi = new HttpApi(this, 'ImageGenerationApi', {
      apiName: 'ImageGenerationApi',
      // FIX: Use 'corsPreflight' property in the constructor
      corsPreflight: {
        // Use the utility to allow GET, PUT, POST, DELETE, HEAD, PATCH
        allowMethods: [CorsHttpMethod.ANY],
        allowOrigins: ['*'], // IMPORTANT: Restrict this in production!
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.days(1), // Cache preflight response for 1 day
      },
    });

    // 4. Create the API Integration (POST /generate)
    const generateIntegration = new HttpLambdaIntegration(
      'GenerateImageIntegration',
      generateImageLambda
    );

    httpApi.addRoutes({
      path: '/generate',
      methods: [HttpMethod.POST],
      integration: generateIntegration,
    });

    // 5. Output the API URL
    this.apiUrl = new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.url || 'No API URL available',
    });
  }
}