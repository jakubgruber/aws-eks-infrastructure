# AWS EKS with AppMesh managed by CDK
This repository holds the infrastructure which is managed by AWS CDK and created Kubernetes cluster running in AWS EKS service with AppMesh service mesh on top.

## Deployment etc.

```shell
PROFILE=playground
ACCOUNT_ID=$(aws sts get-caller-identity --profile $PROFILE | jq -r ".Account")
cdk bootstrap aws://$ACCOUNT_ID/eu-central-1 --profile $PROFILE
cdk deploy --all --profile $PROFILE 

# rm ~/.kube/config
aws eks update-kubeconfig --name pmo-core --region eu-central-1 --role-arn arn:aws:iam::079523228028:role/ClusterStack-eu-central-1-AdminRole38563C57-43EAL5KYNEQM

cdk diff --profile $PROFILE
```