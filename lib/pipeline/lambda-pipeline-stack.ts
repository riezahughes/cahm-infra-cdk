import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_codepipeline as pipeline,
  aws_codepipeline_actions as actions,
  aws_codebuild as codebuild,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class CahLambdaPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // buckets for deploying. One for lambda artifacts

    const artifactBucket = new s3.Bucket(this, "cahm-lambda-deploy-bucket", {
      bucketName: "test-cah-lambda-deployment",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create a new pipeline codebuild project. Make sure to specify the buildspec of the repo and the image to be used.

    const project = new codebuild.PipelineProject(this, "CahmCodeBuild", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
      },
    });

    // Create the new pipeline

    const deployPipeline = new pipeline.Pipeline(
      this,
      "CahmApiCardsLambdaPipeline",
      {
        pipelineName: "test-cahm-lambda-rest-resource-cards",
        crossAccountKeys: false,
        artifactBucket,
      }
    );

    // define the artifact

    const sourceOutput = new pipeline.Artifact();

    // github connection setup

    const sourceAction = new actions.GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: "riezahughes",
      repo: "cahm-lambda-endpoint-cards",
      oauthToken: cdk.SecretValue.secretsManager("CAHM_GITHUB_REPO"),
      output: sourceOutput,
      branch: "master", // default: 'master'
    });

    // codebuild setup

    const buildAction = new actions.CodeBuildAction({
      actionName: "CodeBuild",
      project,
      input: sourceOutput,
    });

    // putting everything together!

    deployPipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    deployPipeline.addStage({
      stageName: "BuildDeploy",
      actions: [buildAction],
    });
  }
}
