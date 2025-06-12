# Multi-Database Setup Guide

This project uses multiple PostgreSQL databases with separate Prisma schemas:

## Database Configuration

### Schema Files
- `prisma/schema-neon.prisma` - Neon database configuration
- `prisma/schema-supabase.prisma` - Supabase database configuration

### Generated Clients
- `prisma/generated/neon/` - Neon Prisma client
- `prisma/generated/supabase/` - Supabase Prisma client

## Setup Instructions

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Update your database URLs in `.env`:**
   ```env
   NEON_DATABASE_URL="your-neon-connection-string"
   SUPABASE_DATABASE_URL="your-supabase-connection-string"
   ```

3. **Generate Prisma clients:**
   ```bash
   npm run db:generate
   ```

## Available Commands

### Client Generation
```bash
npm run db:generate              # Generate both clients
```

### Database Migrations
```bash
npm run db:migrate:neon          # Run Neon migrations (dev)
npm run db:migrate:supabase      # Run Supabase migrations (dev)
npm run db:migrate:deploy:neon   # Deploy Neon migrations (prod)
npm run db:migrate:deploy:supabase # Deploy Supabase migrations (prod)
```

### Database Push (for prototyping)
```bash
npm run db:push:neon             # Push schema to Neon
npm run db:push:supabase         # Push schema to Supabase
```

### Prisma Studio
```bash
npm run db:studio:neon           # Open Neon database in Prisma Studio
npm run db:studio:supabase       # Open Supabase database in Prisma Studio
```

## Usage in Code

```typescript
import { neonClient, supabaseClient } from '@/lib/db'

// Use Neon database
const users = await neonClient.user.findMany()

// Use Supabase database
const profiles = await supabaseClient.profile.findMany()

// Remember to disconnect when done (e.g., in API route cleanup)
import { disconnectAll } from '@/lib/db'
await disconnectAll()
```

## Adding Models

### To Neon Database
Edit `prisma/schema-neon.prisma` and add your models, then run:
```bash
npm run db:migrate:neon
npm run db:generate
```

### To Supabase Database
Edit `prisma/schema-supabase.prisma` and add your models, then run:
```bash
npm run db:migrate:supabase
npm run db:generate
```

## Example Model Structure

### Neon (User management)
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Supabase (User profiles)
```prisma
model Profile {
  id        Int      @id @default(autoincrement())
  userId    String   @unique
  avatar    String?
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Best Practices

1. **Separate concerns:** Use different databases for different domains (e.g., auth vs analytics)
2. **Consistent naming:** Use clear, descriptive model names
3. **Environment separation:** Use different database URLs for dev/staging/prod
4. **Connection management:** Always disconnect clients when done to prevent connection leaks
5. **Error handling:** Wrap database operations in try-catch blocks
