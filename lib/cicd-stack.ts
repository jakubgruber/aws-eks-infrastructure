import * as cdk from '@aws-cdk/core';
import codecommit = require('@aws-cdk/aws-codecommit');
import ecr = require('@aws-cdk/aws-ecr');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import pipelineAction = require('@aws-cdk/aws-codepipeline-actions');
import * as buildspec from '../utils/buildspecs';
import {deployToEKSspec} from "../utils/buildimage/deployspecs";
import * as eks from "@aws-cdk/aws-eks";
import * as iam from "@aws-cdk/aws-iam";
import {BuildSpecType} from "../utils/buildspecs";

export interface CicdProps extends cdk.StackProps {
    regionCluster: eks.Cluster,
    regionRole: iam.Role,
    gitRepositoryName: string,
    ecrRepositoryName: string,
    deploymentRegion: string,
    buildType: BuildSpecType,
}

export class CicdStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: CicdProps) {
        super(scope, id, props);

        const codeCommitRepository = new codecommit.Repository(this, props.gitRepositoryName, {
            repositoryName: `${props.gitRepositoryName}-${cdk.Stack.of(this).region}`
        });

        new cdk.CfnOutput(this, `codecommit-uri`, {
            exportName: `CodeCommitURL-${props.gitRepositoryName}`,
            value: codeCommitRepository.repositoryCloneUrlSsh
        });

        const ecrRepository = new ecr.Repository(this, props.ecrRepositoryName, {
            repositoryName: `${props.ecrRepositoryName}-${cdk.Stack.of(this).region}`
        });

        const buildSpecFunc = buildspec.getBuildSpecFunc(props.buildType)
        const ecrBuild = buildSpecFunc(this, ecrRepository.repositoryUri);

        ecrRepository.grantPullPush(ecrBuild.role!);

        const sourceOutput = new codepipeline.Artifact();

        new codepipeline.Pipeline(this, 'multi-region-eks-dep', {
            stages: [{
                stageName: 'Source',
                actions: [new pipelineAction.CodeCommitSourceAction({
                    actionName: 'CatchSourceFromCode',
                    repository: codeCommitRepository,
                    output: sourceOutput,
                })]
            }, {
                stageName: 'Build',
                actions: [new pipelineAction.CodeBuildAction({
                    actionName: 'BuildAndPushToECR',
                    input: sourceOutput,
                    project: ecrBuild
                })]
            }, {
                stageName: 'DeployToMainEKSCluster',
                actions: [new pipelineAction.CodeBuildAction({
                    actionName: 'DeployToMainEKSCluster',
                    input: sourceOutput,
                    project: deployToEKSspec(this, props.deploymentRegion, props.regionCluster, ecrRepository, props.regionRole),
                }),]
            },
            ]
        });

    }
}


