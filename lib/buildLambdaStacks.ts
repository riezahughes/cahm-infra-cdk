import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaDeploymentStack } from "./custom/LambdaDeploymentStack";

export class CahLambdaBuildStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create new lambdas.
    // set up pipeline for each lambda.

    new LambdaDeploymentStack(this, "card-resource-stack", {
      buildSpecDir: "./buildspec.yml",
      ghBranch: "master",
      ghOwner: "riezahughes",
      ghRepo: "cahm-lambda-endpoint-cards",
      name: "calm-cards-endpoint",
    });
  }
}
