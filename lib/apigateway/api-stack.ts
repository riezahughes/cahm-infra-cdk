import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda_nodejs as lambda,
  aws_apigateway as apigateway,
} from "aws-cdk-lib";

export class CahApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // gateway

    // const backend = new apigateway.RestApi(this, "cahm-rest-api");

    // endpoints
  }
}
