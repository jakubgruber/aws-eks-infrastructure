#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {ClusterStack} from '../lib/cluster-stack';
import {ContainerStack} from '../lib/container-stack';
import {appsDefinition} from "../lib/apps-definition";

export interface ClusterEnvironment {
    account: any,
    region: string,
}

const app = new cdk.App();
const clusterRegion = 'eu-central-1'

const account = app.node.tryGetContext('account') || process.env.CDK_INTEG_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;
const clusterEnv = {account: account, region: clusterRegion} as ClusterEnvironment;

const clusterStack = new ClusterStack(app, `ClusterStack-${clusterEnv.region}`, {env: clusterEnv})

new ContainerStack(app, `ContainerStack-${clusterEnv.region}`, {
    env: clusterEnv,
    cluster: clusterStack.cluster
});

appsDefinition(app, clusterStack, clusterEnv, clusterRegion);