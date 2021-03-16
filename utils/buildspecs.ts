import codebuild = require('@aws-cdk/aws-codebuild');
import * as cdk from '@aws-cdk/core';
import {PipelineProject} from '@aws-cdk/aws-codebuild';

export enum BuildSpecType {
    DOCKERFILE,
    JIB,
}

export function getBuildSpecFunc(specType: BuildSpecType): Function {
    switch (specType) {
        case BuildSpecType.DOCKERFILE:
            return dockerBuildToECR;
        case BuildSpecType.JIB:
            return jibBuildToECR;
    }
}

function dockerBuildToECR(scope: cdk.Construct, ecrRepo: string): PipelineProject {
    return new codebuild.PipelineProject(scope, `docker-build-to-ecr`, {
        projectName: `docker-build-to-ecr`,
        environment: {
            buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
            privileged: true
        },
        environmentVariables: {
            'ECR_REPO_URI': {
                value: ecrRepo
            }
        },
        buildSpec: codebuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
                pre_build: {
                    commands: [
                        'env',
                        `$(aws ecr get-login --region $AWS_DEFAULT_REGION --no-include-email)`,
                        'IMAGE_TAG=$CODEBUILD_RESOLVED_SOURCE_VERSION'
                    ]
                },
                build: {
                    commands: [
                        'docker build -t $ECR_REPO_URI:latest .',
                        'docker tag $ECR_REPO_URI:latest $ECR_REPO_URI:$IMAGE_TAG'
                    ]
                },
                post_build: {
                    commands: [
                        'docker push $ECR_REPO_URI:latest',
                        'docker push $ECR_REPO_URI:$IMAGE_TAG'
                    ]
                }
            }
        })
    });
}

function jibBuildToECR(scope: cdk.Construct, ecrRepo: string): PipelineProject {
    return new codebuild.PipelineProject(scope, `jib-build-to-ecr`, {
        projectName: `jib-build-to-ecr`,
        environment: {
            buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
            privileged: true
        },
        environmentVariables: {
            'ECR_REPO_URI': {
                value: ecrRepo
            }
        },
        buildSpec: codebuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
                pre_build: {
                    commands: [
                        'env',
                        `$(aws ecr get-login --region $AWS_DEFAULT_REGION --no-include-email)`,
                        'IMAGE_TAG=$CODEBUILD_RESOLVED_SOURCE_VERSION',
                        'chmod +x ./gradlew'
                    ]
                },
                build: {
                    commands: ['./gradlew jib --image=$ECR_REPO_URI:$IMAGE_TAG',]
                },
            }
        })
    });

}