FROM python:3-alpine

ENV KUBECONFIG /home/kubectl/.kube/kubeconfig
ENV HOME /home/kubectl

RUN \
	mkdir /root/bin /aws; \
    apk add --update groff less bash py-pip jq curl && \
	pip install --upgrade pip; \
	pip install awscli && \
	apk --purge -v del py-pip && \
	rm /var/cache/apk/* && \
	adduser kubectl -Du 5566

# curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

ADD https://dl.k8s.io/release/v1.20.4/bin/linux/amd64/kubectl /usr/local/bin/kubectl

WORKDIR $HOME

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod a+x /usr/local/bin/kubectl /usr/local/bin/entrypoint.sh


# USER kubectl
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]