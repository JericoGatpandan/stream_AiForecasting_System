# Stream - Deployment Guide

This guide provides step-by-step instructions for deploying the Stream application on Railway.

## Prerequisites

- Railway account (https://railway.app/)
- GitHub repository with your Stream application code
- MySQL database (can be created on Railway)

## Step 1: Create a New Project on Railway

1. Log in to your Railway account
2. Click on "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your GitHub repository
5. Railway will automatically detect your services

## Step 2: Set Up MySQL Database

1. In your Railway project, click "New Service"
2. Choose "Database" → "MySQL"
3. Once provisioned, go to "Variables" tab and copy the connection details:


## Step 3: Deploy Backend Service

1. In your Railway project, click "New Service"
2. Choose "GitHub Repo"
3. Select your repository and specify the backend directory:
   - Repository: `your-github-username/stream`
   - Service Path: `/backend`

4. Configure environment variables:
   - Go to "Variables" tab in your backend service
   - Add the following variables using the values from your MySQL database:
     ```
     DB_HOST=${MYSQLHOST}
     DB_PORT=${MYSQLPORT}
     DB_USER=${MYSQLUSER}
     DB_PASSWORD=${MYSQLPASSWORD}
     DB_NAME=${MYSQLDATABASE}
     NODE_ENV=production
     PORT=5500
     ```

5. Deploy the backend:
   - Railway will automatically deploy the backend service
   - Once deployed, go to "Settings" → "Domains" to get your backend URL
   - Note this URL for configuring the frontend (e.g., `https://stream-backend.railway.app`)
   

6. Initialize the database:
   - Go to "Variables" tab in your backend service
   - Add a temporary variable `SEED_DATABASE=true` to trigger the database initialization
   - Restart the service, which will run the seed scripts
   - After successful seeding, remove the `SEED_DATABASE` variable

## Step 4: Deploy Frontend Service

1. In your Railway project, click "New Service"
2. Choose "GitHub Repo"
3. Select your repository and specify the frontend directory:
   - Repository: `your-github-username/stream`
   - Service Path: `/frontend`

4. Configure environment variables:
   - Go to "Variables" tab in your frontend service
   - Add the following variable:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
   - Replace `your-backend-url` with the actual domain of your deployed backend

5. Deploy the frontend:
   - Railway will automatically deploy the frontend service
   - Once deployed, go to "Settings" → "Domains" to get your frontend URL

## Step 5: Connect Your Domain (Optional)

1. Purchase a domain name from a domain registrar
2. In your Railway project, go to each service's "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., api.yourdomain.com for backend, yourdomain.com for frontend)
5. Follow Railway's instructions to update your DNS settings

## Step 6: Monitor Your Application

1. Use the Railway dashboard to monitor your application
2. Check logs for any errors
3. Monitor resource usage to ensure your application runs efficiently

## Troubleshooting

### Backend Connection Issues

- Check environment variables in the frontend to ensure the API URL is correctly set
- Verify that the backend service is running
- Check the backend logs for any errors

### Database Connection Issues

- Verify database credentials in environment variables
- Check if the database is running
- Review backend logs for database connection errors

### Deployment Failures

- Check the deployment logs in Railway
- Ensure all required dependencies are listed in package.json
- Verify that build scripts are correctly configured in railway.json