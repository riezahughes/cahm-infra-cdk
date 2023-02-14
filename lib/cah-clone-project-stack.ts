import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda_nodejs as lambda,
  aws_s3 as s3,
  aws_codepipeline as pipeline,
  aws_codepipeline_actions as actions,
  aws_codebuild as codebuild,
  aws_apigateway as apigateway,
  aws_route53 as route53,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_codecommit as codecommit,
} from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CahCloneProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // search for domain

    const route = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: "cahm.online",
    });

    // bucket for storing the project
    const cahCloneWebsite = new s3.Bucket(this, "cahCloneWebsite", {
      bucketName: "test-cah-clone",
      publicReadAccess: false, // we'll use Cloudfront to access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const artifactBucket = new s3.Bucket(this, "cahm-deploy-bucket", {
      bucketName: "test-cah-clone-deployment",
      publicReadAccess: false, // we'll use Cloudfront to access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // const accessIdentity = new OriginAccessIdentity(this, "CloudfrontAccess");
    // const cloudfrontUserAccessPolicy = new PolicyStatement();
    // cloudfrontUserAccessPolicy.addActions("s3:GetObject");
    // cloudfrontUserAccessPolicy.addPrincipals(accessIdentity.grantPrincipal);
    // cloudfrontUserAccessPolicy.addResources(cahCloneWebsite.arnForObjects("*"));
    // cahCloneWebsite.addToResourcePolicy(cloudfrontUserAccessPolicy);

    const certArn =
      "arn:aws:acm:us-east-1:839586265759:certificate/5443e611-d748-456f-8972-0cfbd1279eec";

    const cert = Certificate.fromCertificateArn(
      this,
      "CahmCertificateImported",
      certArn
    );

    // const cert = new Certificate(this, "Certificate", {
    //   domainName: "cahm.online",
    //   certificateName: "cahmonline",
    //   validation: CertificateValidation.fromDns(),
    // });

    new cloudfront.Distribution(this, "cahmCloudfront", {
      defaultBehavior: { origin: new origins.S3Origin(cahCloneWebsite) },
      domainNames: ["cahm.online"],
      certificate: cert,
    });

    // const cfDist = new cloudfront.CloudFrontWebDistribution(
    //   this,
    //   "CfDistribution",
    //   {
    //     comment: "CDK Cloudfront Secure S3",
    //     viewerCertificate: ViewerCertificate.fromAcmCertificate(cert, {
    //       aliases: ["cahm.online", "www.cahm.online"],
    //     }),
    //     defaultRootObject: "index.html",
    //     viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    //     httpVersion: HttpVersion.HTTP2,
    //     priceClass: PriceClass.PRICE_CLASS_100, // the cheapest
    //     originConfigs: [
    //       {
    //         s3OriginSource: {
    //           originAccessIdentity: accessIdentity,
    //           s3BucketSource: cahCloneWebsite,
    //           originPath: `/index.html`,
    //         },
    //         behaviors: [
    //           {
    //             compress: true,
    //             isDefaultBehavior: true,
    //           },
    //         ],
    //       },
    //     ],
    //     // Allows React to handle all errors internally
    //     errorConfigurations: [
    //       {
    //         errorCachingMinTtl: 300, // in seconds
    //         errorCode: 403,
    //         responseCode: 200,
    //         responsePagePath: `/index.html`,
    //       },
    //       {
    //         errorCachingMinTtl: 300, // in seconds
    //         errorCode: 404,
    //         responseCode: 200,
    //         responsePagePath: `/index.html`,
    //       },
    //     ],
    //   }
    // );

    const project = new codebuild.PipelineProject(this, "CahmCodeBuild");

    const deployPipeline = new pipeline.Pipeline(this, "CahmFrontendPipeline", {
      pipelineName: "CahmFrontendPipeline",
      crossAccountKeys: false,
      artifactBucket,
    });

    const sourceOutput = new pipeline.Artifact();

    const sourceAction = new actions.GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: "riezahughes",
      repo: "cahm-repo",
      oauthToken: cdk.SecretValue.secretsManager("CAHM_GITHUB_REPO"),
      output: sourceOutput,
      branch: "master", // default: 'master'
    });

    const buildAction = new actions.CodeBuildAction({
      actionName: "CodeBuild",
      project,
      input: sourceOutput,
      outputs: [new pipeline.Artifact()], // optional
      executeBatchBuild: true, // optional, defaults to false
      combineBatchBuildArtifacts: true, // optional, defaults to false
    });

    const deployAction = new actions.S3DeployAction({
      actionName: "S3Deploy",
      bucket: cahCloneWebsite,
      input: sourceOutput,
    });

    deployPipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    deployPipeline.addStage({
      stageName: "Build",
      actions: [buildAction],
    });

    deployPipeline.addStage({
      stageName: "Deploy",
      actions: [deployAction],
    });

    // const pipeline = new CodePipeline(this, "CahmFrontendPipeline", {
    //   pipelineName: "CahmFrontendPipeline",
    //   synth: new ShellStep("Synth", {
    //     input: CodePipelineSource.gitHub("riezahughes/cahm-repo", "master", {
    //       authentication: cdk.SecretValue.secretsManager("CAHM_GITHUB_REPO"),
    //     }),

    //     primaryOutputDirectory: "frontend/dist",
    //     commands: [
    //       "cd frontend",
    //       "npm i",
    //       "npm run build",
    //       "cd ../",
    //       "npx cdk synth",
    //     ],
    //   }),
    // });

    // const cahCloneFrontendPipeline = new pipeline.Pipeline()

    // FRONTEND
    // Needs a website bucket with custom DNS, needs a codepipeline, needs a codebuild

    // BACKEND
    // needs an api gateway with a custom DNS, needs lambda's attached to resources. This also needs a codepipeline attached so it knows where all the lambdas to deploy are.

    //
  }
}
