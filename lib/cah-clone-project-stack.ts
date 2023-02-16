import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda_nodejs as lambda,
  aws_s3 as s3,
  aws_codepipeline as pipeline,
  aws_codepipeline_actions as actions,
  aws_codebuild as codebuild,
  aws_apigateway as apigateway,
  aws_route53 as route53,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_codecommit as codecommit,
} from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";

export class CahCloneProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create hosted zone for route53 domain

    const route = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: "cahm.link",
    });

    // bucket the project is stored on.
    const cahCloneWebsite = s3.Bucket.fromBucketName(
      this,
      "cahCloneWebsite",
      "test-cah-clone"
    );

    // set up ssl certificate

    const cert = new Certificate(this, "Certificate", {
      domainName: "cahm.link",
      certificateName: "cahmlink",
      validation: CertificateValidation.fromDns(route),
    });

    // run cloudfront

    new cloudfront.Distribution(this, "cahmCloudfront", {
      defaultBehavior: { origin: new origins.S3Origin(cahCloneWebsite) },
      domainNames: ["cahm.link"],
      certificate: cert,
    });

    // const cfDist = new cloudfront.CloudFrontWebDistribution(
    //   this,
    //   "CfDistribution",
    //   {
    //     comment: "CDK Cloudfront Secure S3",
    //     viewerCertificate: ViewerCertificate.fromAcmCertificate(cert, {
    //       aliases: ["cahm.online", "www.cahm.online"],
    //     }),
    //     defaultRootObject: "index.html",
    //     viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    //     httpVersion: HttpVersion.HTTP2,
    //     priceClass: PriceClass.PRICE_CLASS_100, // the cheapest
    //     originConfigs: [
    //       {
    //         s3OriginSource: {
    //           originAccessIdentity: accessIdentity,
    //           s3BucketSource: cahCloneWebsite,
    //           originPath: `/index.html`,
    //         },
    //         behaviors: [
    //           {
    //             compress: true,
    //             isDefaultBehavior: true,
    //           },
    //         ],
    //       },
    //     ],
    //     // Allows React to handle all errors internally
    //     errorConfigurations: [
    //       {
    //         errorCachingMinTtl: 300, // in seconds
    //         errorCode: 403,
    //         responseCode: 200,
    //         responsePagePath: `/index.html`,
    //       },
    //       {
    //         errorCachingMinTtl: 300, // in seconds
    //         errorCode: 404,
    //         responseCode: 200,
    //         responsePagePath: `/index.html`,
    //       },
    //     ],
    //   }
    // );

    // FRONTEND
    // Needs a website bucket with custom DNS, needs a codepipeline, needs a codebuild

    // BACKEND
    // needs an api gateway with a custom DNS, needs lambda's attached to resources. This also needs a codepipeline attached so it knows where all the lambdas to deploy are.

    //
  }
}
