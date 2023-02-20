# Infrastructure using CDK

I've designed this repo to be standalone and seperate from the project. This willagood example of showing what i can do with AWS's CDK. The repo attached to this project will be linked below once it's set up and built.

The project requires the following manual steps:

- Creating a Certificate for the domain using ACM

There's a bunch of steps here for building, but i'll get to that later. Right now i'mi too busy building.

<!-- - `npm run build`
- `cdk synth`
- `cdk deploy CahDomainStack`
- Manually set the name servers
- `cdk deploy CahCloneProjectStack`
- Check resources to make sure everything is ready. -->

sick of it? Fucked it up?

`cdk destroy [stackname without the brackets]`

## Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
