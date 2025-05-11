# Calculator Microservice with MongoDB – SIT737 Task 9.1P

This project is a containerized calculator microservice deployed on Kubernetes. It supports basic arithmetic operations and stores calculation history in MongoDB.

## Features

- Basic operations: Add, Subtract, Multiply, Divide, Modulo
- UI built with HTML + Bootstrap
- MongoDB integration using Mongoose
- Stores and displays calculation history
- Edit and delete past calculations
- Manual backup and restore using `mongodump` and `mongorestore`

## Technologies

- Node.js + Express
- MongoDB + Mongoose
- Docker
- Kubernetes (Deployment, Service, PVC, Secrets, CronJob)

## How to Deploy

1. **Build & Push Docker Image**
   ```bash
   docker build -t your-dockerhub-username/calculator-microservice .
   docker push your-dockerhub-username/calculator-microservice

2. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f mongo-deployment.yaml
   kubectl apply -f mongo-secret.yaml
   kubectl apply -f mongo-pvc.yaml

3. **Access the App**
   ```bash
   kubectl port-forward deployment/calculator-deployment 3005:3005
