import * as cdk from "aws-cdk-lib";
import { SecretValue, aws_route53 as route53 } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class CahDomainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Pipeline code goes here

    const route = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: "cahm.online",
    });
  }
}
