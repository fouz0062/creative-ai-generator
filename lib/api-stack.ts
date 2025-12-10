// lib/api-stack.ts
//

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha'; // <--- NEW Import
import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb'; 
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam'; // ⬅️ NEW: Import IAM for policy statements
import { IUserPool, IUserPoolClient } from 'aws-cdk-lib/aws-cognito'; // <--- NEW Import

// Define the interface for the ApiStack's props
export interface ApiStackProps extends cdk.StackProps {
  imagesTable: Table; 
  imageBucket: Bucket;
  userPool: IUserPool; // <--- NEW: Cognito User Pool
  userPoolClient: IUserPoolClient; // <--- NEW: Cognito App Client
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

    // 4. Define the Cognito Authorizer
    const userPoolAuthorizer = new HttpUserPoolAuthorizer(
      'UserPoolAuthorizer',
      props.userPool,
      {
        userPoolClients: [props.userPoolClient],
        identitySource: ['$request.header.Authorization'], // Expect JWT in the Authorization header
      }
    );

    // 5. Create the API Integration (POST /generate)
    const generateIntegration = new HttpLambdaIntegration(
      'GenerateImageIntegration',
      generateImageLambda
    );

    // 6. Add a SECURED route to the API Gateway
    this.httpApi.addRoutes({
      path: '/generate',
      methods: [HttpMethod.POST],
      integration: generateIntegration,
      authorizer: userPoolAuthorizer, // <--- Apply the authorizer here
    });

    // 7. Create List Images Lambda Function
    const listImagesLambda = new lambda.Function(this, 'ListImagesHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'listImages')),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        DYNAMODB_TABLE_NAME: props.imagesTable.tableName,
      },
    });

    // 8. Grant Read Permissions to List Images Lambda
    props.imagesTable.grantReadData(listImagesLambda);

    // 9. Create the List Images Integration (GET /images)
    const listImagesIntegration = new HttpLambdaIntegration(
      'ListImagesIntegration',
      listImagesLambda
    );

    // 10. Add List Images route to the API Gateway
    this.httpApi.addRoutes({
      path: '/images',
      methods: [HttpMethod.GET],
      integration: listImagesIntegration,
      authorizer: userPoolAuthorizer, // <--- Apply the authorizer here
    });

    // 11. Create Delete Image Lambda Function
    const deleteImageLambda = new lambda.Function(this, 'DeleteImageHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'deleteImage')),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        DYNAMODB_TABLE_NAME: props.imagesTable.tableName,
        S3_BUCKET_NAME: props.imageBucket.bucketName,
      },
    });

    // 12. Grant Delete Permissions
    props.imagesTable.grantReadWriteData(deleteImageLambda);
    props.imageBucket.grantDelete(deleteImageLambda);

    // 13. Create the Delete Image Integration (DELETE /images/{imageId})
    const deleteImageIntegration = new HttpLambdaIntegration(
      'DeleteImageIntegration',
      deleteImageLambda
    );

    // 14. Add Delete Image route to the API Gateway
    this.httpApi.addRoutes({
      path: '/images/{imageId}',
      methods: [HttpMethod.DELETE],
      integration: deleteImageIntegration,
      authorizer: userPoolAuthorizer, // <--- Apply the authorizer here
    });

    // 15. Output the API URL
    this.apiUrl = new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.httpApi.url || 'No API URL available',
    });
  }
}