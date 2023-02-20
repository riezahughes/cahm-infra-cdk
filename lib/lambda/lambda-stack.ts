import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda as lambda, aws_ssm as ssm } from "aws-cdk-lib";
import { defaultCode } from "../../helpers";

export class CahLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create new lambdas.
    // set up pipeline for each lambda.
    const cardResource = new lambda.Function(this, "CahmCardLambda", {
      code: lambda.Code.fromInline(defaultCode),
      handler: "src/app.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "cah-api-card-resource",
    });

    new ssm.StringParameter(this, "cardResourceLambdaArn", {
      parameterName: `/lambdaStack/cardResourceArn`,
      stringValue: cardResource.functionArn,
    });
  }
}
