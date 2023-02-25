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

    // Requires a manual setup of making sure the domain exists
    //

    const route = route53.HostedZone.fromLookup(
      this,
      "cahm-route53-hosted-zone",
      {
        domainName: "cahm.online",
      }
    );
  }
}
