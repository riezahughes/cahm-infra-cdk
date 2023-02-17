import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda as lambda } from "aws-cdk-lib";

export class CahLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create new lambdas.
    // set up pipeline for each lambda.
    const cardResource = new lambda.Function(this, "CahmCardLambda", {
      code: lambda.Code.fromInline("return console.log('yarp')"),
      handler: "src/app.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "Cah-Api-Card-Resource",
    });
  }
}
