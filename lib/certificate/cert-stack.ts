import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_route53 as route53,
  aws_certificatemanager as acm,
  aws_ssm as ssm,
} from "aws-cdk-lib";

export class CahCertStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create hosted zone for route53 domain

    const route = route53.HostedZone.fromLookup(
      this,
      "cahm-online-hosted-zone",
      {
        domainName: "cahm.online",
      }
    );

    // set up ssl certificate

    const cert = new acm.Certificate(this, "cah-ssl-cert", {
      domainName: "cahm.online",
      subjectAlternativeNames: ["*3.cahm.online"],
      validation: acm.CertificateValidation.fromDns(route),
    });

    new ssm.StringParameter(this, "cah-cert-string", {
      parameterName: "/certstack/certarn",
      stringValue: cert.certificateArn,
    });
  }
}
