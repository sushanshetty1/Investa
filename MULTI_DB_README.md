# 🚀 **Invista Multi-Database Architecture**

## **🎯 Architecture Overview**

Invista implements a sophisticated **dual-database architecture** that separates concerns for optimal performance, security, and maintainability:

```
┌─────────────────────────────────────────────────────────────────┐
│                        INVISTA SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   🔐 SUPABASE DB    │    │       ⚡ NEON DB             │ │
│  │                     │    │                               │ │
│  │ • Authentication    │◄──►│ • Products & Inventory       │ │
│  │ • User Management   │    │ • Orders & Customers         │ │
│  │ • Roles & Permissions│   │ • Suppliers & Purchases      │ │
│  │ • Sessions & Security│   │ • Warehouses & Logistics     │ │
│  │ • Audit Logs        │    │ • Reports & Analytics        │ │
│  │ • Notifications     │    │ • Financial Management       │ │
│  │ • API Keys          │    │ • Quality Control            │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## **🔄 Database Responsibilities**

### **🔐 Supabase Database** (Authentication & Security)
- **User accounts and profiles**
- **Role-based access control (RBAC)**
- **Session management with device tracking**
- **Multi-factor authentication**
- **API key management**
- **System audit logs**
- **User notifications**
- **Team invitations**
- **System configuration**

### **⚡ Neon Database** (Business Operations)
- **Product catalog management**
- **Multi-warehouse inventory**
- **Order processing & fulfillment**
- **Supplier relationship management**
- **Purchase order management**
- **Customer management**
- **Shipping & logistics**
- **Financial transactions**
- **Quality control & audits**
- **Analytics & reporting**

## **📊 Schema Statistics**

| Database | Tables | Models | Key Features |
|----------|--------|--------|--------------|
| **Supabase** | 12 | 14 | Authentication, Security, User Management |
| **Neon** | 35+ | 40+ | Inventory, Orders, Suppliers, Analytics |

## **🛠️ Development Commands**

### **🔧 Database Generation**
```bash
# Generate both Prisma clients
npm run db:generate

# Generate individual clients
npx prisma generate --schema=prisma/schema-neon.prisma
npx prisma generate --schema=prisma/schema-supabase.prisma
```

### **🗄️ Database Migrations**
```bash
# Create migrations for both databases
npm run db:migrate:neon
npm run db:migrate:supabase

# Deploy migrations to production
npm run db:migrate:deploy:neon
npm run db:migrate:deploy:supabase
```

### **🔍 Database Inspection**
```bash
# Open Prisma Studio for each database
npm run db:studio:neon      # Business data
npm run db:studio:supabase  # User data

# Push schema changes without migrations
npm run db:push:neon
npm run db:push:supabase
```

## **💻 Code Examples**

### **🔐 Authentication Flow**
```typescript
import { supabaseClient, neonClient } from '@/lib/db'

// 1. Authenticate user (Supabase)
const loginUser = async (email: string, password: string) => {
  const session = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  // 2. Get user profile and roles
  const userWithRoles = await supabaseClient.user.findUnique({
    where: { id: session.user.id },
    include: {
      userRoles: {
        include: { role: true }
      }
    }
  })
  
  return userWithRoles
}
```

### **📦 Inventory Management**
```typescript
// Create product with inventory across warehouses
const createProductWithInventory = async (productData: any, userId: string) => {
  // Create product in Neon
  const product = await neonClient.product.create({
    data: {
      ...productData,
      createdBy: userId, // Reference to Supabase user
      inventoryItems: {
        create: productData.warehouses.map((warehouse: any) => ({
          warehouseId: warehouse.id,
          quantity: warehouse.quantity,
          location: warehouse.location
        }))
      }
    }
  })
  
  // Log action in Supabase audit
  await supabaseClient.auditLog.create({
    data: {
      userId,
      action: 'CREATE',
      resource: 'products',
      resourceId: product.id,
      newValues: productData
    }
  })
  
  return product
}
```

### **🛒 Order Processing**
```typescript
// Complete order workflow
const processOrder = async (orderData: any, userId: string) => {
  // 1. Create order in Neon
  const order = await neonClient.order.create({
    data: {
      ...orderData,
      createdBy: userId,
      items: {
        create: orderData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      }
    }
  })
  
  // 2. Reserve inventory
  for (const item of orderData.items) {
    await neonClient.stockReservation.create({
      data: {
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        reservationType: 'ORDER',
        referenceId: order.id,
        reservedBy: userId
      }
    })
  }
  
  // 3. Send notification (Supabase)
  await supabaseClient.userNotification.create({
    data: {
      userId,
      title: 'Order Created',
      message: `Order ${order.orderNumber} has been created successfully`,
      type: 'SUCCESS'
    }
  })
  
  return order
}
```

### **📊 Cross-Database Analytics**
```typescript
// Get comprehensive dashboard data
const getDashboardData = async (userId: string) => {
  // Get user context from Supabase
  const user = await supabaseClient.user.findUnique({
    where: { id: userId },
    include: { userRoles: { include: { role: true } } }
  })
  
  // Get business metrics from Neon
  const metrics = await Promise.all([
    neonClient.product.count(),
    neonClient.order.count({
      where: { status: 'PENDING' }
    }),
    neonClient.inventoryItem.aggregate({
      _sum: { quantity: true }
    }),
    neonClient.supplier.count({
      where: { status: 'ACTIVE' }
    })
  ])
  
  return {
    user,
    metrics: {
      totalProducts: metrics[0],
      pendingOrders: metrics[1],
      totalInventory: metrics[2]._sum.quantity,
      activeSuppliers: metrics[3]
    }
  }
}
```

## **🔐 Security Model**

### **Access Control Flow**
```typescript
// Middleware for API routes
export const authMiddleware = async (req: NextRequest) => {
  // 1. Verify session with Supabase
  const session = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')
  
  // 2. Get user permissions
  const user = await supabaseClient.user.findUnique({
    where: { id: session.user.id },
    include: {
      userRoles: {
        include: { role: true }
      }
    }
  })
  
  // 3. Check permissions for Neon operations
  const hasPermission = user.userRoles.some(ur => 
    ur.role.permissions.includes(req.operation)
  )
  
  if (!hasPermission) throw new Error('Forbidden')
  
  return { user, session }
}
```

### **Data Isolation**
- **Supabase**: Contains only user credentials, profiles, and system data
- **Neon**: Contains business data with user ID references
- **No direct foreign keys** between databases
- **API layer** enforces data access rules

## **📈 Performance Optimizations**

### **Connection Management**
```typescript
// Optimized client setup
const neonClient = new NeonPrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  datasources: {
    db: {
      url: process.env.NEON_DATABASE_URL
    }
  }
})

const supabaseClient = new SupabasePrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  datasources: {
    db: {
      url: process.env.SUPABASE_DATABASE_URL
    }
  }
})

// Connection pooling
export const getConnection = (database: 'neon' | 'supabase') => {
  return database === 'neon' ? neonClient : supabaseClient
}
```

### **Query Optimization**
```typescript
// Efficient cross-database queries
const getUserWithBusinessData = async (userId: string) => {
  // Parallel queries to both databases
  const [user, businessData] = await Promise.all([
    supabaseClient.user.findUnique({
      where: { id: userId },
      include: { userRoles: true }
    }),
    neonClient.order.findMany({
      where: { createdBy: userId },
      include: { items: true },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
  ])
  
  return { user, recentOrders: businessData }
}
```

## **🚀 Deployment Strategy**

### **Environment Configuration**
```env
# Production
SUPABASE_DATABASE_URL="postgresql://..."
NEON_DATABASE_URL="postgresql://..."

# Staging
SUPABASE_DATABASE_URL_STAGING="postgresql://..."
NEON_DATABASE_URL_STAGING="postgresql://..."

# Development
SUPABASE_DATABASE_URL_DEV="postgresql://..."
NEON_DATABASE_URL_DEV="postgresql://..."
```

### **Migration Strategy**
```bash
# 1. Deploy Supabase changes first (auth/users)
npm run db:migrate:deploy:supabase

# 2. Deploy Neon changes (business logic)
npm run db:migrate:deploy:neon

# 3. Verify both databases are in sync
npm run db:status
```

## **🔄 Data Synchronization**

### **User Reference Integrity**
```typescript
// Ensure user exists before creating business records
const createWithUserValidation = async (data: any, userId: string) => {
  // Verify user exists in Supabase
  const user = await supabaseClient.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    throw new Error('Invalid user reference')
  }
  
  // Create business record in Neon
  return await neonClient[model].create({
    data: {
      ...data,
      createdBy: userId
    }
  })
}
```

## **📊 Monitoring & Maintenance**

### **Health Checks**
```typescript
export const healthCheck = async () => {
  try {
    // Test Supabase connection
    await supabaseClient.$queryRaw`SELECT 1`
    
    // Test Neon connection  
    await neonClient.$queryRaw`SELECT 1`
    
    return { status: 'healthy', databases: ['supabase', 'neon'] }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}
```

### **Performance Monitoring**
```typescript
// Query performance tracking
const trackQuery = async (database: string, operation: string, query: Function) => {
  const start = Date.now()
  
  try {
    const result = await query()
    const duration = Date.now() - start
    
    // Log performance metrics
    console.log(`${database}.${operation}: ${duration}ms`)
    
    return result
  } catch (error) {
    // Log errors with context
    console.error(`${database}.${operation} failed:`, error)
    throw error
  }
}
```

## **🧪 Testing Strategy**

### **Database Testing**
```typescript
// Test database setup
beforeAll(async () => {
  // Setup test databases
  await supabaseClient.$connect()
  await neonClient.$connect()
})

afterAll(async () => {
  // Cleanup
  await supabaseClient.$disconnect()
  await neonClient.$disconnect()
})

// Cross-database test
test('should create order with user validation', async () => {
  // Create test user in Supabase
  const user = await supabaseClient.user.create({
    data: { email: 'test@example.com' }
  })
  
  // Create test order in Neon
  const order = await neonClient.order.create({
    data: {
      customerId: 'test-customer',
      createdBy: user.id
    }
  })
  
  expect(order.createdBy).toBe(user.id)
})
```

## **🎯 Benefits Summary**

✅ **Security**: Isolated authentication from business data  
✅ **Performance**: Optimized for different query patterns  
✅ **Scalability**: Independent scaling of auth vs business logic  
✅ **Maintainability**: Clear separation of concerns  
✅ **Compliance**: Better data governance and audit trails  
✅ **Flexibility**: Can swap databases independently  
✅ **Development**: Clear boundaries between team responsibilities  

This architecture makes Invista a **world-class inventory management system** ready for enterprise deployment with the security, performance, and scalability needed for modern supply chain operations.

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
