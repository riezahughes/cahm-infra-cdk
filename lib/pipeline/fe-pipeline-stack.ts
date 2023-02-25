import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_codepipeline as pipeline,
  aws_codepipeline_actions as actions,
  aws_codebuild as codebuild,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class CahFrontendPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // buckets for deploying. One for the actual website, one for the artifacts for the pipeline

    const cahCloneWebsite = new s3.Bucket(this, "cah-clone-website", {
      bucketName: "test-cah-clone",
      publicReadAccess: false, // we'll use Cloudfront to access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    const artifactBucket = new s3.Bucket(this, "cahm-deploy-bucket", {
      bucketName: "test-cah-clone-deployment",
      publicReadAccess: false, // we'll use Cloudfront to access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create a new pipeline codebuild project. Make sure to specify the buildspec of the repo and the image to be used.

    const project = new codebuild.PipelineProject(this, "CahmCodeBuild", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename(
        "frontend/buildspec.yml"
      ),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
      },
    });

    // Create the new pipeline

    const deployPipeline = new pipeline.Pipeline(this, "CahmFrontendPipeline", {
      pipelineName: "CahmFrontendPipeline",
      crossAccountKeys: false,
      artifactBucket,
    });

    // define the artifacts

    const sourceOutput = new pipeline.Artifact();
    const buildOutput = new pipeline.Artifact();

    // github connection setup

    const sourceAction = new actions.GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: "riezahughes",
      repo: "cahm-repo",
      oauthToken: cdk.SecretValue.secretsManager("CAHM_GITHUB_REPO"),
      output: sourceOutput,
      branch: "master", // default: 'master'
    });

    // codebuild setup

    const buildAction = new actions.CodeBuildAction({
      actionName: "CodeBuild",
      project,
      input: sourceOutput,
      outputs: [buildOutput], // optional
    });

    // S3 deployment setup

    const deployAction = new actions.S3DeployAction({
      actionName: "S3Deploy",
      bucket: cahCloneWebsite,
      input: buildOutput,
      extract: true,
    });

    // putting everything together!

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
  }
}
