# Manage your EKS Cluster with CDK
This repository holds the skeleton code where you would start the journey to *[Manage your EKS Cluster with CDK](http://demogo-multiregion-eks.s3-website.ap-northeast-2.amazonaws.com/ko/)* Hands-on Lab.

Please clone this repository and start [the workshop](http://demogo-multiregion-eks.s3-website.ap-northeast-2.amazonaws.com/ko/) to play with the lab. :)


## Related Repository
* [Skeleton Repository](https://github.com/yjw113080/aws-cdk-eks-multi-region-skeleton): You would clone this repository and build up the code as going through the steps in the lab.
* [Full-code Repository](https://github.com/yjw113080/aws-cdk-eks-multi-region): Once you complete the workshop, the code would look like this repository! You can also use this repository as a sample code to actually build CDK project for your own infrastructure and containers.
* [CI/CD for CDK](https://github.com/yjw113080/aws-cdk-multi-region-cicd): Fabulous CDK team is working on providing CI/CD natively, in the meantime, you can check out simple way to do it with AWS CodePipeline and CodeBuild.
* [Sample App for Multi-region Application Deployment](https://github.com/yjw113080/aws-cdk-multi-region-sample-app): In third lab of [this workshop](http://demogo-multiregion-eks.s3-website.ap-northeast-2.amazonaws.com/ko/), you will deploy your application in your developer's shoes. This repository holds the sample app to deploy. The sample simply says 'Hello World' with the information where it is hosted.

## Commands etc.

```shell
PROFILE=playground
ACCOUNT_ID=$(aws sts get-caller-identity --profile $PROFILE | jq -r ".Account")
cdk bootstrap aws://$ACCOUNT_ID/eu-central-1 --profile $PROFILE
cdk deploy --all --profile $PROFILE 

# rm ~/.kube/config
aws eks update-kubeconfig --name pmo-core --region eu-central-1 --role-arn arn:aws:iam::079523228028:role/ClusterStack-eu-central-1-AdminRole38563C57-43EAL5KYNEQM

cdk diff --profile $PROFILE

# start docker
cdk deploy CicdStack-hello-py --profile $PROFILE

# save codecommit url
# generate AWS ssh keys, add to ~/.ssh/config (https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-ssh-unixes.html?icmpid=docs_acc_console_connect_np)

git add remote codecommit <codecommitUrl>
git push codecommit master

kubectl config current-context
# view all contexts
kubectl config get-contexts

# view pods
kubectl get pods

# view services
kubectl get services
# get load balancer url and curl it
curl $(kubectl get service hello-py -o jsonpath='{.status.loadBalancer.ingress[*].hostname}') && echo ""

kubectl describe ingress hello-py-ingress

kubectl get all -n ingress-nginx

kubectl get service ingress-nginx-controller
```