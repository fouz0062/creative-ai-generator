import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';


// 2. Define a custom class to export the resources it creates
export class StorageStack extends Stack {
  public readonly imageBucket: Bucket;
  public readonly imagesTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3 Bucket for Generated Images
    this.imageBucket = new Bucket(this, 'ImageStorageBucket', {
      // You can add properties like removalPolicy, autoDeleteObjects, etc.
    });

    // DynamoDB Table to store image metadata
    this.imagesTable = new Table(this, 'ImageMetadataTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      // Optional: Add sortKey, billingMode, removalPolicy, etc.
    });
  }
}