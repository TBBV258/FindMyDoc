# Deploying to Vercel

This document provides instructions for deploying the Find My Document application to Vercel.

## Prerequisites

1. A Vercel account
2. A GitHub repository containing your project
3. A PostgreSQL database (such as Neon, Supabase, or any other provider)

## Database Setup

1. Create a PostgreSQL database on your preferred provider (Neon is recommended for Vercel deployments)
2. Get the database connection string

## Deployment Steps

### 1. Connect Your Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 2. Configure Environment Variables

1. Add the following environment variables in the Vercel project settings:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: `production`

### 3. Deploy Your Project

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Once deployed, your application will be available at the assigned Vercel URL

## Post-Deployment Tasks

### Database Migration

After deployment, you need to run database migrations to create the required tables:

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Link your project: `vercel link`
4. Run the database migration: `vercel --prod run npm run db:push`

### Custom Domain (Optional)

To add a custom domain to your Vercel deployment:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain and follow the provided instructions

## Troubleshooting

If you encounter issues with the deployment:

1. Check the build logs in Vercel
2. Ensure environment variables are correctly set
3. Verify database connection string is correct and the database is accessible
4. Check for any errors in the Function Logs

## Local Development

For local development, continue using the existing workflow:

```bash
npm run dev
```

## Monitoring and Maintenance

After deployment, monitor your application using Vercel Analytics and make updates by pushing to your GitHub repository. Vercel will automatically deploy new changes.