# Company Ownership & Hierarchy Implementation

## Overview

The Invista inventory management system has been enhanced with a comprehensive company ownership and hierarchy structure. This implementation provides proper multi-tenancy, access control, and organizational management capabilities.

## Company Structure

### Company Model (Supabase Schema)
The `Company` model serves as the root entity for all business operations:

```prisma
model Company {
    id String @id @default(uuid())
    
    // Basic Information
    name          String
    displayName   String?
    description   String?
    website       String?
    industry      String?
    size          CompanySize @default(SMALL)
    
    // Business Details
    registrationNumber String? @unique
    taxId              String? @unique
    vatNumber          String?
    businessType       BusinessType @default(PRIVATE)
    
    // Subscription & Features
    subscriptionPlan  SubscriptionPlan @default(FREE)
    subscriptionStatus SubscriptionStatus @default(ACTIVE)
    maxUsers      Int @default(5)
    maxWarehouses Int @default(1)
    maxProducts   Int @default(100)
    
    // Relations
    companyUsers  CompanyUser[]
    departments   Department[]
    locations     CompanyLocation[]
    // ... other relations
}
```

### Company Hierarchy

#### 1. **Company Users (CompanyUser)**
- Links users to companies with specific roles and permissions
- Supports organizational hierarchy with managers and direct reports
- Role-based access control within each company

```prisma
model CompanyUser {
    // Company context
    companyId String
    userId    String
    
    // Role & Hierarchy
    role         CompanyRole @default(EMPLOYEE)
    managerId    String? // References another CompanyUser
    departmentId String?
    
    // Access Control
    permissions  Json? // Company-specific permissions
    isOwner      Boolean @default(false)
    canInvite    Boolean @default(false)
    canManageBilling Boolean @default(false)
}
```

#### 2. **Departments**
- Hierarchical department structure within companies
- Support for nested departments (parent-child relationships)
- Department heads and budget management

#### 3. **Company Locations**
- Multiple physical locations per company
- Support for different location types (HQ, Office, Warehouse, Store, etc.)
- Contact information and business hours per location

## Business Entity Ownership

All major business entities now include a `companyId` field to ensure proper ownership:

### Core Business Models (Neon Schema)
1. **Products** - `companyId` field added
2. **Warehouses** - `companyId` field added  
3. **Orders** - `companyId` field added
4. **Customers** - `companyId` field added
5. **Suppliers** - `companyId` field added

This ensures that:
- All inventory, orders, and customer data belongs to a specific company
- Users can only access data from companies they belong to
- Data isolation is maintained between different companies

## Access Control & Permissions

### Company Roles
```prisma
enum CompanyRole {
    OWNER        // Full access, billing, company settings
    ADMIN        // Most access, user management
    MANAGER      // Department/team management
    SUPERVISOR   // Limited management access
    EMPLOYEE     // Standard user access
    CONTRACTOR   // Limited temporary access
    VIEWER       // Read-only access
}
```

### Hierarchical Permissions
- **Company Owners**: Full access to all company data and settings
- **Admins**: User management, most operational features
- **Managers**: Department-specific access and team management
- **Employees**: Standard operational access within their scope
- **Contractors**: Time-limited access with specific permissions

## Subscription & Billing

### Subscription Tiers
```prisma
enum SubscriptionPlan {
    FREE        // Limited features, 5 users, 1 warehouse
    BASIC       // Small businesses
    PROFESSIONAL // Growing companies
    ENTERPRISE  // Large organizations
    CUSTOM      // Custom requirements
}
```

### Feature Limits
- **maxUsers**: Maximum number of users per company
- **maxWarehouses**: Maximum number of warehouses
- **maxProducts**: Maximum number of products
- **features**: Array of enabled features based on subscription

## Integration & APIs

### Company Integrations
Support for third-party integrations with company-specific configurations:
- E-commerce platforms (Shopify, WooCommerce)
- Accounting systems (QuickBooks, Xero)
- CRM systems (Salesforce, HubSpot)
- Shipping providers (FedEx, UPS, DHL)

### API Access Control
- Company-scoped API keys
- Rate limiting per company
- Usage tracking and billing

## Implementation Benefits

### 1. **Multi-Tenancy**
- Complete data isolation between companies
- Secure multi-tenant architecture
- Scalable for SaaS deployment

### 2. **Organizational Structure**
- Realistic business hierarchy modeling
- Department-based organization
- Manager-employee relationships

### 3. **Access Control**
- Granular permissions system
- Role-based access control
- Company-specific user management

### 4. **Billing & Subscription**
- Subscription-based feature control
- Usage tracking and limits
- Automatic billing integration

### 5. **Compliance & Auditing**
- Company-specific audit logs
- Compliance with data protection regulations
- Complete activity tracking

## Database Architecture

### Two-Database Approach
- **Supabase DB**: Authentication, users, companies, billing
- **Neon DB**: Business logic, inventory, orders, products

### Benefits of This Architecture
1. **Separation of Concerns**: Auth/user management vs business logic
2. **Scalability**: Independent scaling of different concerns
3. **Security**: Sensitive user data isolated from business operations
4. **Flexibility**: Different optimization strategies for different data types

## Next Steps for Implementation

### 1. **API Updates**
- Update all API endpoints to include company context
- Add company-based filtering to all queries
- Implement company-scoped authorization

### 2. **Frontend Updates**
- Company selection/switching interface
- Company settings and management pages
- User invitation and role management

### 3. **Database Migration**
- Create migration scripts for existing data
- Add company references to existing records
- Set up proper foreign key constraints

### 4. **Testing**
- Multi-tenant testing scenarios
- Permission and access control testing
- Data isolation verification

This implementation provides a solid foundation for a professional, scalable, multi-tenant inventory management system with proper organizational hierarchy and access control.
