import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda_nodejs as lambda,
  aws_s3 as s3,
  aws_codepipeline as pipeline,
  aws_codebuild as codebuild,
  aws_apigateway as apigateway,
} from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { BlockPublicAccess } from "aws-cdk-lib/aws-s3";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CahCloneProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cahCloneWebsite = new s3.Bucket(this, "cahCloneWebsite", {
      websiteIndexDocument: "index.html", // your sites main page
      websiteErrorDocument: "index.html", // for simplicity
      publicReadAccess: false, // we'll use Cloudfront to access
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const pipeline = new CodePipeline(this, "CahmFrontendPipeline", {
      pipelineName: "CahmFrontendPipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub("riezahughes/cahm-repo", "master", {
          authentication: cdk.SecretValue.secretsManager("CAHM_GITHUB_REPO"),
        }),

        primaryOutputDirectory: "dist",
        commands: [
          "cd frontend",
          "ls -la src/assets",
          "npm i",
          "npm run build",
          "npx cdk synth",
        ],
      }),
    });

    const cert = new Certificate(this, "Certificate", {
      domainName: "cahm.online",
      validation: CertificateValidation.fromDns(),
    });

    // const cahCloneFrontendPipeline = new pipeline.Pipeline()

    // FRONTEND
    // Needs a website bucket with custom DNS, needs a codepipeline, needs a codebuild

    // BACKEND
    // needs an api gateway with a custom DNS, needs lambda's attached to resources. This also needs a codepipeline attached so it knows where all the lambdas to deploy are.

    //
  }
}
