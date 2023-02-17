import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_route53 as route53,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
} from "aws-cdk-lib";

export class CahCloudfrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const route = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: "cahm.link",
    });

    const cahCloneWebsite = s3.Bucket.fromBucketName(
      this,
      "cahCloneWebsite",
      "test-cah-clone"
    );

    const cert = "<insert cert here>";

    // new cloudfront.Distribution(this, "cahmCloudfront", {
    //   defaultBehavior: { origin: new origins.S3Origin(cahCloneWebsite) },
    //   domainNames: ["cahm.link"],
    //   certificate: cert,
    // });
  }
}
