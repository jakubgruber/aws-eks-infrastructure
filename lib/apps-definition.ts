import {App} from "@aws-cdk/core";
import {ClusterStack} from "./cluster-stack";
import {CicdStack} from "./cicd-stack";
import {ClusterEnvironment} from "../bin/multi-cluster-ts";
import {BuildSpecType} from "../utils/buildspecs";

export function appsDefinition(app: App, stack: ClusterStack, clusterEnv: ClusterEnvironment, clusterRegion: string) {
    new CicdStack(app, `CicdStack-hello-py`, {
        env: clusterEnv,
        regionCluster: stack.cluster,
        regionRole: stack.regionRole,
        deploymentRegion: clusterRegion,
        gitRepositoryName: 'hello-py',
        ecrRepositoryName: 'hello-py-ecr',
        buildType: BuildSpecType.DOCKERFILE,
    });

    new CicdStack(app, `CicdStack-kotlin-jib`, {
        env: clusterEnv,
        regionCluster: stack.cluster,
        regionRole: stack.regionRole,
        deploymentRegion: clusterRegion,
        gitRepositoryName: 'kotlin-jib',
        ecrRepositoryName: 'kotlin-jib-ecr',
        buildType: BuildSpecType.JIB,
    });
}
