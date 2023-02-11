import * as cdk from "aws-cdk-lib";
import { SecretValue } from "aws-cdk-lib";
import { aws_codepipeline as codePipeline } from "aws-cdk-lib";
import { CodePipeline } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class CahPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Pipeline code goes here

    const githubToken = SecretValue.secretsManager("GITHUB_SECRET");

    const sourceArtifact = new codePipeline.Artifact();
    const cloudAssemblyArtifact = new codePipeline.Artifact();

    // const pipeline = new
  }
}
