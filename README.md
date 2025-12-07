# Application with Neon Database

This application uses [Neon Database](https://neon.tech) with different configurations for development and production environments.

## Architecture

- **Development**: Uses Neon Local proxy via Docker to create ephemeral database branches
- **Production**: Connects directly to Neon Cloud database

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- Node.js 22+ (for local development without Docker)
- Neon account and project

## Environment Setup

### 1. Get Neon Credentials

From your [Neon Console](https://console.neon.tech):

1. **API Key**: Go to Account Settings → API Keys
2. **Project ID**: Found under Project Settings → General
3. **Branch ID**: Get your main branch ID from the project dashboard
4. **Database URL**: Copy the connection string for production

### 2. Configure Environment Files

Copy the templates and fill in your credentials:

```bash
# Copy and edit development config
cp .env.development.example .env.development

# Copy and edit production config  
cp .env.production.example .env.production
```

**`.env.development`** (for Neon Local):
```env
NODE_ENV=development
NEON_API_KEY=neon_api_1abc2def3ghi4jkl5mno6pqr7stu8vwx
NEON_PROJECT_ID=cold-mountain-12345
PARENT_BRANCH_ID=br-wispy-meadow-67890
DATABASE_NAME=myapp
```

**`.env.production`** (for Neon Cloud):
```env
NODE_ENV=production
DATABASE_URL=postgres://username:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/myapp?sslmode=require
PORT=3000
```

## Development Setup

Run locally with Neon Local proxy:

```bash
# Start both app and Neon Local proxy
docker compose --env-file .env.development -f docker-compose.dev.yml up --build

# Or run in detached mode
docker compose --env-file .env.development -f docker-compose.dev.yml up -d --build
```

### What happens:
1. Neon Local container starts and creates an ephemeral branch
2. Your app connects to `postgres://neon:npg@neon-local:5432/myapp`
3. When you stop the containers, the ephemeral branch is automatically deleted

### Database Connection in Development

Your application should read `DATABASE_URL` from environment variables. In development, Docker Compose automatically sets:

```
DATABASE_URL=postgres://neon:npg@neon-local:5432/myapp?sslmode=require
```

### Using Neon Serverless Driver (JavaScript)

If using `@neondatabase/serverless`, configure it for Neon Local:

```javascript
import { neon, neonConfig } from '@neondatabase/serverless';

if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);
```

## Production Deployment

### Option 1: Docker Compose

```bash
# Deploy with production config
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

### Option 2: Container Platform (Railway, Render, etc.)

1. Build and push your Docker image:
```bash
docker build -t your-app .
docker tag your-app your-registry/your-app:latest
docker push your-registry/your-app:latest
```

2. Set environment variables on your platform:
```
NODE_ENV=production
DATABASE_URL=postgres://username:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/myapp?sslmode=require
```

## Commands Reference

```bash
# Development
docker compose --env-file .env.development -f docker-compose.dev.yml up --build
docker compose --env-file .env.development -f docker-compose.dev.yml down

# Production  
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml down

# View logs
docker compose logs app
docker compose logs neon-local

# Shell into containers
docker exec -it app-dev sh
docker exec -it neon-local-proxy sh
```

## Troubleshooting

### Neon Local Issues

1. **Connection refused**: Ensure Neon Local container is healthy
   ```bash
   docker compose ps
   docker compose logs neon-local
   ```

2. **Branch creation fails**: Check your API key and project ID
3. **SSL errors**: For JavaScript apps, add `ssl: { rejectUnauthorized: false }` to pg config

### Production Issues

1. **Database connection fails**: Verify your Neon Cloud DATABASE_URL
2. **SSL required**: Ensure `?sslmode=require` is in connection string
3. **Connection limits**: Neon has connection limits based on your plan

## File Structure

```
.
├── Dockerfile                 # Multi-stage Node.js container
├── docker-compose.dev.yml     # Development with Neon Local
├── docker-compose.prod.yml    # Production with Neon Cloud
├── .env.development          # Dev environment variables
├── .env.production           # Prod environment variables  
├── .gitignore                # Excludes .env.* and .neon_local/
└── README.md                 # This file
```

## Security Notes

- Never commit `.env.*` files to version control
- Use secrets management in production (Docker secrets, Kubernetes secrets, etc.)
- Rotate your Neon API keys regularly
- The `.neon_local/` directory contains branch metadata - keep it out of git

## Learn More

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Branching Guide](https://neon.com/docs/guides/branching)
- [Neon Serverless Driver](https://neon.com/docs/serverless/serverless-driver)