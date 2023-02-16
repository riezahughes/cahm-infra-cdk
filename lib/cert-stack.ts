import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_route53 as route53,
  aws_certificatemanager as certificate,
} from "aws-cdk-lib";

export class CahCertStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create hosted zone for route53 domain

    const route = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: "cahm.link",
    });

    // set up ssl certificate

    const cert = new certificate.Certificate(this, "Certificate", {
      domainName: "cahm.link",
      certificateName: "cahmlink",
      validation: certificate.CertificateValidation.fromDns(route),
    });
  }
}
