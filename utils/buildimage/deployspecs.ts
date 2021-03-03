import codebuild = require('@aws-cdk/aws-codebuild');
import * as cdk from "@aws-cdk/core";
import * as eks from "@aws-cdk/aws-eks";
import * as ecr from "@aws-cdk/aws-ecr";
import * as iam from "@aws-cdk/aws-iam";
import {PipelineProject} from "@aws-cdk/aws-codebuild";

export function deployToEKSspec(scope: cdk.Construct, region: string, cluster: eks.Cluster, ecrRepo: ecr.IRepository, roleToAssume: iam.Role): PipelineProject {

    const deployBuildSpec = new codebuild.PipelineProject(scope, `deploy-to-eks-${region}`, {
        environment: {
            buildImage: codebuild.LinuxBuildImage.fromAsset(scope, `custom-image-for-eks-${region}`, {
                directory: './utils/buildimage'
            })
        },
        environmentVariables: {
            'REGION': {value: region},
            'CLUSTER_NAME': {value: cluster.clusterName},
            'ECR_REPO_URI': {value: ecrRepo.repositoryUri},
        },
        buildSpec: codebuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
                install: {
                    commands: [
                        'env',
                        'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}',
                        '/usr/local/bin/entrypoint.sh']
                },
                build: {
                    commands: [
                        `CREDENTIALS=$(aws sts assume-role --role-arn "${roleToAssume.roleArn}" --role-session-name codebuild-cdk)`,
                        `export AWS_ACCESS_KEY_ID="$(echo \${CREDENTIALS} | jq -r '.Credentials.AccessKeyId')"`,
                        `export AWS_SECRET_ACCESS_KEY="$(echo \${CREDENTIALS} | jq -r '.Credentials.SecretAccessKey')"`,
                        `export AWS_SESSION_TOKEN="$(echo \${CREDENTIALS} | jq -r '.Credentials.SessionToken')"`,
                        `export AWS_EXPIRATION=$(echo \${CREDENTIALS} | jq -r '.Credentials.Expiration')`,
                        `sed -i 's@CONTAINER_IMAGE@'"$ECR_REPO_URI:$TAG"'@' kubernetes/app-deployment.yaml`,
                        'kubectl apply -f kubernetes/app-deployment.yaml'
                    ]
                }
            }
        })
    });

    deployBuildSpec.addToRolePolicy(new iam.PolicyStatement({
        actions: ['eks:DescribeCluster'],
        resources: [`*`],
    }));

    deployBuildSpec.addToRolePolicy(new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [roleToAssume.roleArn]
    }))

    return deployBuildSpec;

}