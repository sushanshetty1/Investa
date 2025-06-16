# 🗄️ **Invista Database Schemas Documentation**

## **Overview**

Invista uses a **dual-database architecture** to optimize performance, security, and maintainability:

1. **🔐 Supabase Database** - Authentication, user management, and security
2. **⚡ Neon Database** - Business logic, inventory management, and analytics

This separation provides:
- **Security**: Sensitive user data isolated from business data
- **Performance**: Optimized queries for different use cases
- **Scalability**: Independent scaling of auth vs business logic
- **Compliance**: Better data governance and access control

---

## **🔐 Supabase Database Schema**

**Purpose**: Handles all authentication, user management, security, and system administration.

### **Core Models**

#### **👤 User Management**
- **`User`** - Core user accounts with profile information
- **`Role`** - Permission-based roles (Admin, Manager, Employee, etc.)
- **`UserRole`** - Many-to-many relationship between users and roles
- **`UserPreference`** - User-specific settings and preferences

#### **🔒 Authentication & Security**
- **`UserSession`** - Active user sessions with device tracking
- **`LoginHistory`** - Complete audit trail of login attempts
- **`PasswordReset`** - Secure password reset tokens
- **`ApiKey`** - API access keys for integrations

#### **📧 Invitations & Onboarding**
- **`UserInvitation`** - Team member invitation system
- **`InvitationStatus`** - Invitation lifecycle tracking

#### **🔔 Notifications**
- **`UserNotification`** - In-app notifications system
- **`NotificationType`** - Different notification categories
- **`NotificationPriority`** - Priority levels for notifications

#### **📊 Audit & Compliance**
- **`AuditLog`** - Complete audit trail of user actions
- **`SystemSetting`** - Global system configuration

### **Key Features**

✅ **Multi-factor Authentication Support**  
✅ **Role-based Access Control (RBAC)**  
✅ **Session Management with Device Tracking**  
✅ **Comprehensive Audit Logging**  
✅ **Team Invitation System**  
✅ **Real-time Notifications**  
✅ **API Key Management**  
✅ **User Preferences & Settings**  

---

## **⚡ Neon Database Schema**

**Purpose**: Handles all business operations, inventory management, supply chain, and analytics.

### **🏷️ Product Management**

#### **Core Product Models**
- **`Product`** - Master product catalog with rich attributes
- **`ProductVariant`** - Product variations (size, color, etc.)
- **`Category`** - Hierarchical product categorization
- **`Brand`** - Brand management with contact details
- **`ProductBundle`** - Product bundling for promotions

#### **Product Features**
- **SKU & Barcode Management**
- **Multi-level Categories**
- **Product Variants & Attributes**
- **Rich Media Support (Images, Videos)**
- **SEO Optimization Fields**
- **Brand Association**
- **Product Reviews & Ratings**

### **📦 Inventory Management**

#### **Core Inventory Models**
- **`Warehouse`** - Multi-location warehouse management
- **`InventoryItem`** - Real-time stock levels per location
- **`InventoryMovement`** - Complete movement history
- **`StockTransfer`** - Inter-warehouse transfers
- **`StockReservation`** - Order-based stock reservations

#### **Inventory Features**
- **Multi-Warehouse Support**
- **Real-time Stock Tracking**
- **Location-based Inventory (Zone/Aisle/Shelf)**
- **Lot/Batch Tracking**
- **Serial Number Management**
- **Expiry Date Tracking**
- **Quality Control Status**
- **Automated Reorder Points**

### **🏭 Supplier Management**

#### **Supplier Models**
- **`Supplier`** - Comprehensive supplier profiles
- **`ProductSupplier`** - Product-supplier relationships
- **`SupplierContact`** - Multiple contacts per supplier
- **`SupplierDocument`** - Document management

#### **Supplier Features**
- **Performance Metrics Tracking**
- **Multiple Contact Management**
- **Document Storage & Management**
- **Rating & Review System**
- **Payment Terms Management**
- **Certification Tracking**

### **🛒 Purchase Management**

#### **Purchase Models**
- **`PurchaseOrder`** - Complete purchase order lifecycle
- **`PurchaseOrderItem`** - Line items with tracking
- **`GoodsReceipt`** - Receiving management
- **`GoodsReceiptItem`** - Quality control & inspection

#### **Purchase Features**
- **Multi-stage Approval Workflow**
- **Supplier Integration**
- **Quality Control & Inspection**
- **Partial Receipts Support**
- **Cost Tracking & Analysis**
- **Lead Time Management**

### **👥 Customer Management**

#### **Customer Models**
- **`Customer`** - B2B and B2C customer profiles
- **`CustomerContact`** - Multiple contacts per customer
- **`Order`** - Sales order management
- **`OrderItem`** - Order line items with fulfillment

#### **Customer Features**
- **B2B & B2C Support**
- **Credit Limit Management**
- **Multiple Shipping Addresses**
- **Order History & Analytics**
- **Customer Segmentation**

### **🚚 Logistics & Shipping**

#### **Logistics Models**
- **`Shipment`** - Shipment tracking
- **`ShipmentPackage`** - Package-level tracking
- **`ShipmentTracking`** - Real-time delivery updates

#### **Logistics Features**
- **Multi-Carrier Support**
- **Real-time Tracking**
- **Package Optimization**
- **Delivery Confirmation**
- **Exception Handling**

### **💰 Financial Management**

#### **Financial Models**
- **`SupplierInvoice`** - Accounts payable
- **`CustomerInvoice`** - Accounts receivable

#### **Financial Features**
- **Multi-Currency Support**
- **Payment Terms Management**
- **Invoice Automation**
- **Credit Management**

### **📊 Audit & Quality Control**

#### **Audit Models**
- **`InventoryAudit`** - Cycle counting & audits
- **`InventoryAuditItem`** - Item-level audit results

#### **Audit Features**
- **Cycle Counting**
- **Full Physical Counts**
- **Variance Analysis**
- **Adjustment Tracking**
- **Quality Control Integration**

---

## **🔗 Database Integration**

### **How the Databases Work Together**

```typescript
// Example: Creating an order
import { supabaseClient, neonClient } from '@/lib/db'

// 1. Get user info from Supabase
const user = await supabaseClient.user.findUnique({
  where: { email: userEmail }
})

// 2. Create order in Neon with user reference
const order = await neonClient.order.create({
  data: {
    customerId: customerId,
    createdBy: user.id, // Reference to Supabase user
    // ... other order data
  }
})
```

### **Cross-Database References**

- **`createdBy`** fields in Neon reference User IDs from Supabase
- **`userId`** fields link business operations to authenticated users
- **API keys** in Supabase control access to Neon data
- **Audit logs** track actions across both databases

---

## **🏗️ Database Architecture Benefits**

### **🔐 Security**
- **Principle of Least Privilege**: Business logic can't access auth data
- **Data Isolation**: PII separated from operational data
- **Independent Security Policies**: Different access controls per database

### **⚡ Performance**
- **Optimized Queries**: Each database optimized for its use case
- **Independent Scaling**: Scale auth and business logic separately
- **Reduced Contention**: Separate connection pools

### **🛠️ Maintainability**
- **Clear Separation of Concerns**: Auth vs Business Logic
- **Independent Deployments**: Migrate/update databases independently
- **Team Specialization**: Different teams can own different aspects

### **📈 Scalability**
- **Horizontal Scaling**: Each database can scale independently
- **Geographic Distribution**: Deploy databases in different regions
- **Load Distribution**: Distribute read/write loads appropriately

---

## **🚀 Getting Started**

### **1. Environment Setup**
```bash
# Add to your .env file
SUPABASE_DATABASE_URL="postgresql://..."
NEON_DATABASE_URL="postgresql://..."
```

### **2. Generate Prisma Clients**
```bash
npm run db:generate
```

### **3. Run Migrations**
```bash
npm run db:migrate:supabase
npm run db:migrate:neon
```

### **4. Use in Your Application**
```typescript
import { supabaseClient, neonClient } from '@/lib/db'

// Query user data
const user = await supabaseClient.user.findUnique({
  where: { id: userId }
})

// Query business data
const products = await neonClient.product.findMany({
  include: {
    category: true,
    inventoryItems: true
  }
})
```

---

## **📋 Development Guidelines**

### **✅ Best Practices**
1. **Never store business data in Supabase**
2. **Always reference Supabase User IDs in Neon for audit trails**
3. **Use transactions for complex operations**
4. **Implement proper error handling across databases**
5. **Regular backups for both databases**

### **🔄 Data Flow Patterns**
1. **Authentication** → Supabase handles login/registration
2. **Authorization** → Check user roles in Supabase
3. **Business Operations** → Execute in Neon with user context
4. **Audit Logging** → Log actions in both databases

---

## **📊 Analytics & Reporting**

The schema supports comprehensive analytics:

- **📈 Sales Analytics**: Revenue, trends, forecasting
- **📦 Inventory Analytics**: Stock levels, turnover, optimization
- **🚚 Supply Chain Analytics**: Lead times, supplier performance
- **👥 Customer Analytics**: Behavior, segmentation, lifetime value
- **💰 Financial Analytics**: Costs, margins, profitability

---

This dual-database architecture positions Invista as a **world-class inventory and supply chain management system** with enterprise-grade security, performance, and scalability. The comprehensive schemas support everything from small businesses to large enterprises with complex supply chain requirements.
