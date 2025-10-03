# Deployment Steps

Clone repo
* `git clone https://github.com/pukar10/interview-public-python-ai.git`
* `git checkout agnostic`

Deploy all resources
* `kubectl apply -k k8s_manifests`

Destroy all resources
* `kubectl delete -k k8s_manifests`
