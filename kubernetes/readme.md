kubectl apply -f namespace.yml
kubectl apply -f secret.yml
kubectl apply -f configmap.yml
kubectl apply -f db.yml
kubectl apply -f backend.yml
kubectl apply -f frontend.yml
kubectl apply -f ingress.yml


docker tag flux-frontend musman2003/flux-frontend:latest
docker tag flux-backend musman2003/flux-backend:latest


docker push musman2003/flux-frontend:latest
docker push musman2003/flux-backend:latest


kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml


kubectl get services -n argocd
kubectl port-forward service/argocd-server -n argocd 8080:443


kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

xYhijVrxWO-wu2N4




argocd app create flux --repo https://github.com/mUsman2003/Flux.git --path myapp --dest-server https://kubernetes.default.svc --dest-namespace default --helm --sync-policy automated --auto-prune --self-heal
