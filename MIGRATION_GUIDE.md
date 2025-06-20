# Migration Guide: Implementing Company Hierarchy

## Overview
This guide walks through the steps needed to migrate from the current schema to the new company ownership and hierarchy structure.

## Prerequisites
- Backup all existing data
- Ensure development environment is set up
- Test the migration on a copy of production data first

## Step 1: Database Schema Migration

### Supabase Database (Authentication & Company Management)

1. **Apply the new Supabase schema:**
```bash
cd invista
npx prisma migrate dev --schema=prisma/schema-supabase.prisma --name "add-company-hierarchy"
```

2. **Create initial company data:**
```sql
-- Create a default company for existing data
INSERT INTO companies (id, name, display_name, created_by, setup_complete)
VALUES (gen_random_uuid(), 'Default Company', 'Default Company', 'system', true);
```

### Neon Database (Business Logic)

1. **Add companyId columns to existing tables:**
```sql
-- Add companyId to products
ALTER TABLE products ADD COLUMN company_id TEXT NOT NULL DEFAULT 'default-company-id';

-- Add companyId to warehouses  
ALTER TABLE warehouses ADD COLUMN company_id TEXT NOT NULL DEFAULT 'default-company-id';

-- Add companyId to orders
ALTER TABLE orders ADD COLUMN company_id TEXT NOT NULL DEFAULT 'default-company-id';

-- Add companyId to customers
ALTER TABLE customers ADD COLUMN company_id TEXT NOT NULL DEFAULT 'default-company-id';

-- Add companyId to suppliers
ALTER TABLE suppliers ADD COLUMN company_id TEXT NOT NULL DEFAULT 'default-company-id';
```

2. **Apply the updated Neon schema:**
```bash
npx prisma migrate dev --schema=prisma/schema-neon.prisma --name "add-company-ownership"
```

## Step 2: Data Migration

### Create Company Users for Existing Users

```sql
-- Assuming you have existing users, create company_users entries
INSERT INTO company_users (id, company_id, user_id, role, is_owner, is_active, joined_at)
SELECT 
    gen_random_uuid(),
    'default-company-id',
    u.id,
    'OWNER',
    true,
    true,
    NOW()
FROM users u
WHERE u.is_active = true;
```

### Update Existing Business Data

```sql
-- Update existing products with the default company ID
UPDATE products 
SET company_id = 'default-company-id' 
WHERE company_id IS NULL;

-- Repeat for other entities...
UPDATE warehouses SET company_id = 'default-company-id' WHERE company_id IS NULL;
UPDATE orders SET company_id = 'default-company-id' WHERE company_id IS NULL;
UPDATE customers SET company_id = 'default-company-id' WHERE company_id IS NULL;
UPDATE suppliers SET company_id = 'default-company-id' WHERE company_id IS NULL;
```

## Step 3: API Layer Updates

### Middleware Updates

1. **Company Context Middleware:**
```typescript
// middleware/company-context.ts
export async function withCompanyContext(req: Request, res: Response, next: NextFunction) {
    const user = req.user; // Assuming user is already authenticated
    
    // Get user's companies
    const companyUsers = await supabaseClient.companyUser.findMany({
        where: { userId: user.id, isActive: true },
        include: { company: true }
    });
    
    // Set current company (can be from header, session, or default)
    const currentCompanyId = req.headers['x-company-id'] || companyUsers[0]?.companyId;
    
    if (!currentCompanyId) {
        return res.status(403).json({ error: 'No company access' });
    }
    
    req.companyId = currentCompanyId;
    req.userCompanies = companyUsers;
    next();
}
```

2. **Update All Business API Routes:**
```typescript
// Example: api/products/route.ts
export async function GET(request: NextRequest) {
    const companyId = request.headers.get('x-company-id');
    
    const products = await neonClient.product.findMany({
        where: { companyId },
        // ... other filters
    });
    
    return Response.json(products);
}
```

### Database Query Updates

Update all database queries to include company filtering:

```typescript
// Before
const products = await neonClient.product.findMany();

// After  
const products = await neonClient.product.findMany({
    where: { companyId: req.companyId }
});
```

## Step 4: Frontend Updates

### Company Provider Context

```tsx
// contexts/CompanyContext.tsx
interface CompanyContextType {
    currentCompany: Company | null;
    userCompanies: CompanyUser[];
    switchCompany: (companyId: string) => void;
}

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
    const [userCompanies, setUserCompanies] = useState<CompanyUser[]>([]);
    
    // Load user's companies on mount
    useEffect(() => {
        loadUserCompanies();
    }, []);
    
    const switchCompany = (companyId: string) => {
        const company = userCompanies.find(cu => cu.companyId === companyId)?.company;
        setCurrentCompany(company || null);
        localStorage.setItem('currentCompanyId', companyId);
    };
    
    return (
        <CompanyContext.Provider value={{ currentCompany, userCompanies, switchCompany }}>
            {children}
        </CompanyContext.Provider>
    );
};
```

### Company Selector Component

```tsx
// components/CompanySelector.tsx
export const CompanySelector: React.FC = () => {
    const { currentCompany, userCompanies, switchCompany } = useCompany();
    
    return (
        <Select value={currentCompany?.id} onValueChange={switchCompany}>
            <SelectTrigger>
                <SelectValue>
                    {currentCompany?.displayName || currentCompany?.name}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {userCompanies.map((cu) => (
                    <SelectItem key={cu.companyId} value={cu.companyId}>
                        {cu.company.displayName || cu.company.name}
                        <span className="text-xs text-muted-foreground">({cu.role})</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
```

### HTTP Client Updates

```typescript
// lib/api-client.ts
class ApiClient {
    private baseURL: string;
    private companyId: string | null = null;
    
    setCompanyId(companyId: string) {
        this.companyId = companyId;
    }
    
    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
            ...(this.companyId && { 'X-Company-ID': this.companyId })
        };
    }
    
    async get(endpoint: string) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            headers: this.getHeaders()
        });
        return response.json();
    }
    // ... other methods
}
```

## Step 5: Permission System Implementation

### Role-Based Access Control

```typescript
// lib/permissions.ts
export const permissions = {
    PRODUCTS: {
        VIEW: 'products:view',
        CREATE: 'products:create',
        UPDATE: 'products:update',
        DELETE: 'products:delete'
    },
    WAREHOUSES: {
        VIEW: 'warehouses:view',
        CREATE: 'warehouses:create',
        UPDATE: 'warehouses:update',
        DELETE: 'warehouses:delete'
    },
    // ... other permissions
};

export const rolePermissions = {
    OWNER: Object.values(permissions).flatMap(p => Object.values(p)),
    ADMIN: [
        permissions.PRODUCTS.VIEW,
        permissions.PRODUCTS.CREATE,
        permissions.PRODUCTS.UPDATE,
        // ... other admin permissions
    ],
    // ... other roles
};

export function hasPermission(userRole: CompanyRole, permission: string): boolean {
    return rolePermissions[userRole]?.includes(permission) || false;
}
```

### Permission Checking Middleware

```typescript
// middleware/check-permission.ts
export function requirePermission(permission: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userCompany = req.userCompanies?.find(cu => cu.companyId === req.companyId);
        
        if (!userCompany || !hasPermission(userCompany.role, permission)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
}
```

## Step 6: Testing

### Test Company Isolation

```typescript
// tests/company-isolation.test.ts
describe('Company Data Isolation', () => {
    it('should only return data for the current company', async () => {
        // Create test companies and data
        const company1 = await createTestCompany();
        const company2 = await createTestCompany();
        
        const product1 = await createTestProduct({ companyId: company1.id });
        const product2 = await createTestProduct({ companyId: company2.id });
        
        // Test API with company1 context
        const response = await request(app)
            .get('/api/products')
            .set('X-Company-ID', company1.id)
            .expect(200);
            
        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBe(product1.id);
    });
});
```

## Step 7: Documentation Updates

1. Update API documentation to include company context
2. Update user guides for company management
3. Create admin guides for company setup
4. Document permission system

## Rollback Plan

If issues arise during migration:

1. **Database Rollback:**
   - Restore from backup
   - Or remove companyId columns if data integrity allows

2. **Code Rollback:**
   - Revert to previous commit
   - Deploy previous version

3. **Data Recovery:**
   - Scripts to recover data from backups
   - Procedures to merge data if needed

## Post-Migration Verification

- [ ] All existing users can access their data
- [ ] Company isolation is working correctly  
- [ ] Permissions are enforced properly
- [ ] All API endpoints include company context
- [ ] Frontend company switching works
- [ ] No data leakage between companies
- [ ] Performance is acceptable with company filtering

## Monitoring

Set up monitoring for:
- API response times with company filtering
- Database query performance
- User access patterns
- Permission denied errors
- Company switching frequency

This migration provides a solid foundation for multi-tenant operations while maintaining data integrity and security.
