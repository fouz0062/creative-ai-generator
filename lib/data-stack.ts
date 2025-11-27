// infra/data-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DataStack extends cdk.Stack {
  public readonly imageBucket: s3.Bucket;
  public readonly imagesTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Define S3 Bucket for Storing Generated Images
    this.imageBucket = new s3.Bucket(this, 'ZiaGenImageBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOTE: Use RETAIN for production!
      autoDeleteObjects: true,
      publicReadAccess: false, // Keep it private
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // 2. Define DynamoDB Table for Image Metadata
    this.imagesTable = new dynamodb.Table(this, 'ZiaGenImagesTable', {
      partitionKey: {
        name: 'userId', // Partition key is the User ID (allows querying by user)
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp', // Sort key is the creation time (allows sorting history)
        type: dynamodb.AttributeType.STRING,
      },
      tableName: 'ZiaGenImages',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOTE: Use RETAIN for production!
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Cost-effective option
    });

    // CDK Outputs
    new cdk.CfnOutput(this, 'ImageBucketName', {
      value: this.imageBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'ImagesTableName', {
      value: this.imagesTable.tableName,
    });
  }
}