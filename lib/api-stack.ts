// lib/api-stack.ts
//

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb'; 
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam'; // ⬅️ NEW: Import IAM for policy statements

// Define the interface for the ApiStack's props
export interface ApiStackProps extends cdk.StackProps {
  imagesTable: Table; 
  imageBucket: Bucket; 
}

export class ApiStack extends cdk.Stack {
  public readonly httpApi: HttpApi;
  public readonly apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // 1. Define the Creative Computer (Lambda Function)
    const generateImageLambda = new lambda.Function(this, 'GenerateImageHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      // Uses existing Code.fromAsset configuration
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'generateImage')), 
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30), // ⬅️ Increased timeout for Bedrock
      memorySize: 512, // ⬅️ Increased memory for image processing
      environment: {
        DYNAMODB_TABLE_NAME: props.imagesTable.tableName,
        S3_BUCKET_NAME: props.imageBucket.bucketName,
      },
    });

    // 2. Grant Permissions to the Lambda's IAM Role
    props.imagesTable.grantWriteData(generateImageLambda);
    props.imageBucket.grantWrite(generateImageLambda);

    // ⬅️ NEW: Grant permission to invoke the Bedrock model
    generateImageLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["bedrock:InvokeModel"],
      // Grants access to Amazon Titan Image Generator (free tier eligible)
      resources: [`arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-image-generator-v1`],
    }));

    // 3. Define the HTTP API Gateway
    this.httpApi = new HttpApi(this, 'ImageGenerationApi', {
      apiName: 'ImageGenerationApi',
      corsPreflight: {
        allowMethods: [CorsHttpMethod.ANY],
        allowOrigins: ['*'],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.days(1),
      },
    });

    // 4. Create the API Integration (POST /generate)
    const generateIntegration = new HttpLambdaIntegration(
      'GenerateImageIntegration',
      generateImageLambda
    );

    this.httpApi.addRoutes({
      path: '/generate',
      methods: [HttpMethod.POST],
      integration: generateIntegration,
    });

    // 5. Output the API URL
    this.apiUrl = new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.httpApi.url || 'No API URL available',
    });
  }
}