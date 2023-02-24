#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import {
  // CahApiStack,
  // CahLambdaPipelineStack,
  // CahFrontendPipelineStack,
  // CahDomainStack,
  // CahCertStack,
  // CahCloudfrontStack,
  // CahLambdaStack,
  CahLambdaBuildStack,
} from "../lib/";

const app = new cdk.App();

new CahLambdaBuildStack(app, "cah-lambda-deployment-stack");
// new CahDomainStack(app, "CahDomainStack");
// new CahLambdaPipelineStack(app, "CahLambdaPipelineStack");
// new CahFrontendPipelineStack(app, "CahPipelineStack");
// new CahCertStack(app, "CahCertStack");
// new CahLambdaStack(app, "CahLambdaStack");
// new CahApiStack(app, "CahApiStack", {
/* If you don't specify 'env', this stack will be environment-agnostic.
 * Account/Region-dependent features and context lookups will not work,
 * but a single synthesized template can be deployed anywhere. */
/* Uncomment the next line to specialize this stack for the AWS Account
 * and Region that are implied by the current CLI configuration. */
// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
/* Uncomment the next line if you know exactly what Account and Region you
 * want to deploy the stack to. */
// env: { account: '123456789012', region: 'us-east-1' },
/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });
// new CahCloudfrontStack(app, "CahCloudfrontStack");
