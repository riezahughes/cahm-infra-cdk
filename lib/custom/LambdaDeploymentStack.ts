import * as cdk from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_sns as sns,
  aws_iam as iam,
  aws_codebuild as codebuild,
  aws_codepipeline as pipeline,
  aws_codepipeline_actions as actions,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export interface LambdaDeploymentProps {
  name?: string;
  buildSpecDir?: string;
  ghOwner?: string;
  ghRepo?: string;
  ghBranch?: string;
}

export class LambdaDeploymentStack extends Construct {
  constructor(scope: Construct, id: string, props: LambdaDeploymentProps = {}) {
    super(scope, id);

    const bucket = new s3.Bucket(this, `${props.name}-lambda-deploy-bucket`, {
      bucketName: `${props.name}-lambda-deploy-bucket`,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const codebuildS3Perms = new iam.PolicyStatement({
      actions: ["s3:Put*"],
      resources: [bucket.arnForObjects("*")],
      principals: [new iam.AnyPrincipal()],
    });

    bucket.addToResourcePolicy(codebuildS3Perms);

    const project = new codebuild.PipelineProject(
      this,
      `${props.name}-pipeline-project`,
      {
        buildSpec: codebuild.BuildSpec.fromSourceFilename(
          `${props.buildSpecDir}`
        ),
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
        },
      }
    );

    project.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["lambda:updateFunctionCode"],
        effect: iam.Effect.ALLOW,
        resources: ["*"],
      })
    );

    // Create the new pipeline

    const deployPipeline = new pipeline.Pipeline(
      this,
      `${props.name}-lambda-pipeline`,
      {
        pipelineName: `${props.name}-lambda-pipeline`,
        crossAccountKeys: false,
        artifactBucket: bucket,
      }
    );

    // define the artifact

    const sourceOutput = new pipeline.Artifact();

    // github connection setup

    const sourceAction = new actions.GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: `${props.ghOwner}`,
      repo: `${props.ghRepo}`,
      oauthToken: cdk.SecretValue.secretsManager("CAHM_GITHUB_REPO"),
      output: sourceOutput,
      branch: `${props.ghBranch}`, // default: 'master'
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
      stageName: "Build",
      actions: [buildAction],
    });
  }
}
