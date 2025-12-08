# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development

```bash
# Start development environment with Neon Local (recommended)
docker compose --env-file .env.development -f docker-compose.dev.yml up --build

# Alternative: Use convenience script
npm run dev:docker
# Or on Windows: pwsh -File scripts/dev.sh

# Local development without Docker (requires Node.js 22+)
npm run dev

# Database operations
npm run db:generate    # Generate Drizzle migrations
npm run db:migrate     # Apply migrations to database
npm run db:studio      # Open Drizzle Studio for database inspection
```

### Production

```bash
# Deploy production with Neon Cloud
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

# Alternative: Use convenience script
npm run prod:docker
```

### Code Quality

```bash
npm run lint           # Check code style with ESLint
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Format code with Prettier
npm run format:check   # Check Prettier formatting
```

## Architecture

### Application Structure

This is a Node.js Express API with a layered architecture using ES modules and import path aliases:

- **Routes** (`src/routes/`) - API endpoint definitions
- **Controllers** (`src/controllers/`) - Request/response handling and validation
- **Services** (`src/services/`) - Business logic layer
- **Models** (`src/models/`) - Drizzle ORM schema definitions
- **Middleware** (`src/middleware/`) - Request processing pipeline
- **Config** (`src/config/`) - Application configuration (database, logging, security)
- **Utils** (`src/utils/`) - Shared utilities (JWT, cookies, formatting)
- **Validations** (`src/validations/`) - Zod schema validation

### Database Architecture

- **ORM**: Drizzle ORM with PostgreSQL
- **Development**: Uses Neon Local proxy for ephemeral database branches
- **Production**: Connects directly to Neon Cloud database
- **Migrations**: Generated and applied via drizzle-kit

### Security Stack

- **Arcjet**: Bot detection, rate limiting, and security policies
- **Rate limiting**: Role-based (Guest: 5/min, User: 10/min, Admin: 20/min)
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **JWT**: Authentication tokens stored in HTTP-only cookies

### Import Path Aliases

The project uses Node.js import maps for clean imports:

```javascript
import logger from '#config/logger.js';
import { createUser } from '#services/auth.service.js';
import { signupSchema } from '#validations/auth.validation.js';
```

Available aliases:

- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

### Environment Configuration

- **Development**: `.env.development` - Neon Local configuration
- **Production**: `.env.production` - Neon Cloud configuration
- **Logging**: Winston with file and console transports
- **Hot reload**: Docker volume mounting for development

### Key Dependencies

- **Express 5.x**: Web framework
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL
- **Arcjet**: Security middleware
- **Zod**: Schema validation
- **Winston**: Logging
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication

### Development Workflow

1. Environment setup requires `.env.development` with Neon credentials
2. Docker Compose orchestrates app + Neon Local proxy
3. Database migrations auto-applied on startup
4. Hot reload enabled via volume mounting
5. Logs written to `logs/` directory and console

### Production Considerations

- Uses optimized Docker build with multi-stage Dockerfile
- Connects directly to Neon Cloud (no local proxy)
- Structured logging to files only
- Security headers and rate limiting active
- Health check endpoint available at `/health`
