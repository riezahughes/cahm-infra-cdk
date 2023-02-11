import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda_nodejs as lambda,
  aws_s3 as s3,
  aws_codepipeline as pipeline,
  aws_codebuild as codebuild,
  aws_apigateway as apigateway,
} from "aws-cdk-lib";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CahCloneProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cahCloneWebsite = new s3.Bucket(this, "cahCloneWebsite", {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
    });

    // const cahCloneFrontendPipeline = new pipeline.Pipeline()

    // FRONTEND
    // Needs a website bucket with custom DNS, needs a codepipeline, needs a codebuild

    // BACKEND
    // needs an api gateway with a custom DNS, needs lambda's attached to resources. This also needs a codepipeline attached so it knows where all the lambdas to deploy are.

    //
  }
}
