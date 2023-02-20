import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda as lambda,
  aws_apigateway as apigateway,
  aws_ssm as ssm,
} from "aws-cdk-lib";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class CahApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cardsLambda = lambda.Function.fromFunctionAttributes(
      this,
      "cah-api-cards-lambda",
      {
        sameEnvironment: true,
        functionArn: ssm.StringParameter.fromStringParameterName(
          this,
          "cardResourceLambdaArn",
          "/lambdaStack/cardResourceArn"
        ).stringValue,
      }
    );

    cardsLambda.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));

    const gateway = new apigateway.RestApi(this, "cah-rest-api", {
      deploy: false,
      restApiName: "cah-rest-api",
      description: "the gateway api to deal with aws resources",
    });

    const cards = new apigateway.LambdaIntegration(cardsLambda, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });

    gateway.root.addMethod("GET", cards);
  }
}
