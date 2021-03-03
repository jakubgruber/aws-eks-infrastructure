import * as cdk from '@aws-cdk/core';
import {readYamlFromDir} from '../utils/read-file';
import * as eks from "@aws-cdk/aws-eks";

export interface EksProps extends cdk.StackProps {
    cluster: eks.Cluster
}

export class ContainerStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: EksProps) {
        super(scope, id, props);

        const cluster = props.cluster;
        const commonFolder = './yaml-common/';
        const regionFolder = `./yaml-${cdk.Stack.of(this).region}/`;

        readYamlFromDir(commonFolder, cluster);
        readYamlFromDir(regionFolder, cluster);
    }

}
