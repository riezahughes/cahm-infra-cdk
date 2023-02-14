import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_codepipeline as pipeline,
  aws_codepipeline_actions as actions,
  aws_codebuild as codebuild,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class CahPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // buckets for deploy

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

    // Pipeline code goes here

    const project = new codebuild.PipelineProject(this, "CahmCodeBuild", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename(
        "frontend/buildspec.yml"
      ),
    });

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
  }
}
