import * as cdk from "aws-cdk-lib";
import { SecretValue } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class CahPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Pipeline code goes here

    const pipeline = new CodePipeline(this, "CahmFrontendPipeline", {
      pipelineName: "MyPipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub(
          "riezahughes/cards-against-huge-manatees",
          "master",
          {
            authentication: cdk.SecretValue.secretsManager("CAHM_GITHUB_REPO"),
          }
        ),
        commands: ["cd frontend", "npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    // const pipeline = new
  }
}
