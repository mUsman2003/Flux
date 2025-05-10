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
