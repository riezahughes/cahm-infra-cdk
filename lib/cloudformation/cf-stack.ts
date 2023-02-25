import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_route53 as route53,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_certificatemanager as acm,
  aws_s3_deployment as s3deploy,
  aws_route53_targets as route53Targets,
  aws_route53_patterns as pattern,
  CfnOutput as logging,
  aws_iam as iam,
  aws_ssm as smm,
} from "aws-cdk-lib";

export class CahCloudfrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // pulls in existing hosted zone route

    const route = route53.HostedZone.fromLookup(
      this,
      "cahm-online-hosted-zone",
      {
        domainName: "cahm.online",
      }
    );

    // pulls in the certificate from ACM related to the domain using value stored in smm. (done on the cert stack)

    const cert = acm.Certificate.fromCertificateArn(
      this,
      `cahm-online-cert`,
      smm.StringParameter.valueForStringParameter(this, "/certstack/certarn")
    );

    // pulls in the website bucket

    const cahCloneWebsite = s3.Bucket.fromBucketName(
      this,
      "cahCloneWebsite",
      "test-cah-clone"
    );

    const cloudFrontAccess = new cloudfront.OriginAccessIdentity(
      this,
      "cahm-cloudfront-permissions-for-s3",
      {
        comment: "Setup for permissions and the s3 bucket",
      }
    );

    const policyStatement = new iam.PolicyStatement({
      actions: ["s3:GetObject"],
      resources: [cahCloneWebsite.arnForObjects("*")],
      principals: [cloudFrontAccess.grantPrincipal],
    });

    const bucketPolicy = new s3.BucketPolicy(
      this,
      "cloudfrontAccessBucketPolicy",
      {
        bucket: cahCloneWebsite,
      }
    );
    bucketPolicy.document.addStatements(policyStatement);

    const cloudFrontDist = new cloudfront.Distribution(
      this,
      "cahm-cloudfront-dist",
      {
        domainNames: ["cahm.online"],
        defaultBehavior: {
          origin: new origins.S3Origin(cahCloneWebsite, {
            originAccessIdentity: cloudFrontAccess,
          }),
          compress: true,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
        errorResponses: [
          {
            httpStatus: 403,
            responsePagePath: "/index.html",
            responseHttpStatus: 200,
            ttl: cdk.Duration.minutes(0),
          },
          {
            httpStatus: 404,
            responsePagePath: "/index.html",
            responseHttpStatus: 200,
            ttl: cdk.Duration.minutes(0),
          },
        ],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        enabled: true,
        certificate: cert,
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        httpVersion: cloudfront.HttpVersion.HTTP2,
        defaultRootObject: "index.html",
        enableIpv6: true,
      }
    );

    new route53.ARecord(this, "cah-non-www-route", {
      recordName: "cahm.online",
      zone: route,
      ttl: cdk.Duration.seconds(20),
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(cloudFrontDist)
      ),
    });

    new pattern.HttpsRedirect(this, "wwwToNonWww", {
      recordNames: ["www.cahm.online"],
      targetDomain: "cahm.online",
      zone: route,
    });

    new logging(this, "DeployURL", {
      value: `https://cahm.online`,
    });
    new logging(this, "CertArn", {
      value: cert.certificateArn,
    });
  }
}
