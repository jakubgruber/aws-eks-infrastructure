import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
import {PhysicalName} from '@aws-cdk/core';

export class ClusterStack extends cdk.Stack {

    public readonly cluster: eks.Cluster;
    public readonly regionRole: iam.Role;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const clusterAdmin = new iam.Role(this, 'AdminRole', {
            assumedBy: new iam.AccountRootPrincipal()
        });

        const cluster = new eks.Cluster(this, 'pmo-core-cluster', {
            clusterName: `pmo-core`,
            mastersRole: clusterAdmin,
            version: eks.KubernetesVersion.V1_18,
            defaultCapacity: 2,
            defaultCapacityInstance: new ec2.InstanceType('r5.large')
        });

        cluster.addAutoScalingGroupCapacity('spot-group', {
            instanceType: new ec2.InstanceType('r5.large'),
            spotPrice: '0.2'
        });

        this.regionRole = createDeployRole(this, `region-deploy-role`, cluster);
        this.cluster = cluster;
    }
}

function createDeployRole(scope: cdk.Construct, id: string, cluster: eks.Cluster): iam.Role {
    const role = new iam.Role(scope, id, {
        roleName: PhysicalName.GENERATE_IF_NEEDED,
        assumedBy: new iam.AccountRootPrincipal()
    });
    cluster.awsAuth.addMastersRole(role);

    return role;
}