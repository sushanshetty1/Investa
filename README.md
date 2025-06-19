# 🏢 Invista - Integrated Inventory & Supply Chain Management System


[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://invista-dbms.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.9.0-2D3748?style=flat&logo=prisma)](https://prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-green?style=flat&logo=supabase)](https://supabase.com/)

> **Invista** is a modern, comprehensive web-based inventory management system designed for real-time inventory tracking, supplier management, and supply chain optimization. Built with Next.js 15, TypeScript, and a dual-database architecture.

## 🌟 Live Demo

**Production URL:** [https://invista-dbms.vercel.app](https://invista-dbms.vercel.app)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Technology Stack](#-technology-stack)
- [🔧 Installation](#-installation)
- [📊 Database Schema](#-database-schema)
- [🔐 Authentication](#-authentication)
- [🎯 Current Functionality](#-current-functionality)
- [📱 User Interface](#-user-interface)
- [🔌 API Endpoints](#-api-endpoints)
- [🎨 UI Components](#-ui-components)
- [📈 Analytics & Reporting](#-analytics--reporting)
- [🛠️ Development](#-development)

## ✨ Features

### 🔐 **Authentication & User Management**
- **Multi-Provider Authentication**: Email/password and Google OAuth integration
- **Secure User Profiles**: Complete profile management with timezone, theme preferences
- **Session Management**: Persistent login with automatic session handling
- **Account Security**: Password reset, account deletion, and security settings

### 📦 **Inventory Management**
- **Product Catalog**: Complete product management with SKU, barcodes, and categorization
- **Category Hierarchy**: Multi-level product categorization with parent-child relationships
- **Brand Management**: Brand organization and product association
- **Stock Tracking**: Real-time inventory levels across multiple warehouses
- **Product Variants**: Support for product variations (size, color, material)

### 🏪 **Warehouse & Stock Operations**
- **Multi-Warehouse Support**: Track inventory across multiple warehouse locations
- **Stock Movements**: Complete audit trail of all inventory transactions
- **Stock Adjustments**: Manual and automated stock level adjustments
- **Low Stock Alerts**: Automatic notifications for products below threshold
- **Quality Control**: QC status tracking for inventory items

### 👥 **Supplier Management**
- **Supplier Directory**: Complete supplier profiles with contact information
- **Performance Tracking**: Supplier rating, delivery performance, and quality metrics
- **Purchase Order Management**: Create and track purchase orders
- **Supplier-Product Relationships**: Link products to preferred suppliers

### 📊 **Dashboard & Analytics**
- **Real-time Dashboards**: Live inventory statistics and key performance indicators
- **Interactive Charts**: Stock movement trends, category breakdown, and performance metrics
- **Recent Activity Feed**: Track all system activities and alerts
- **Inventory Analytics**: Comprehensive analysis of stock levels and movements

### 🎨 **Modern UI/UX**
- **Dark/Light Theme**: System-wide theme switching with user preferences
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices
- **Advanced Data Tables**: Sorting, filtering, pagination, and bulk operations
- **Loading States**: Smooth user experience with loading indicators
- **Toast Notifications**: Real-time feedback for user actions

## 🏗️ Architecture

### **Dual Database Architecture**

Invista uses a sophisticated dual-database setup optimizing for different data types:

```
┌─────────────────┐    ┌─────────────────┐
│   SUPABASE DB   │    │    NEON DB      │
│                 │    │                 │
│ • Authentication│    │ • Products      │
│ • User Profiles │    │ • Inventory     │
│ • Sessions      │    │ • Suppliers     │
│ • Security      │    │ • Warehouses    │
└─────────────────┘    │ • Categories    │
                       │ • Stock Moves   │
                       └─────────────────┘
```

**Supabase Database:**
- Handles all authentication and user management
- Real-time subscriptions for user sessions
- Secure authentication with OAuth providers

**Neon Database:**
- Stores all business data and inventory information
- High-performance queries for inventory operations
- Complex relationships and business logic

## 🚀 Technology Stack

### **Frontend**
- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization
- **State Management**: React Context + Hooks

### **Backend**
- **API**: Next.js API Routes
- **Database ORM**: Prisma 6.9.0
- **Authentication**: Supabase Auth
- **Validation**: Zod schema validation
- **Rate Limiting**: Custom implementation

### **Database**
- **Primary DB**: Neon PostgreSQL (Business Data)
- **Auth DB**: Supabase PostgreSQL (User Management)
- **Schema Management**: Prisma migrations

### **Deployment**
- **Platform**: Vercel
- **Analytics**: Vercel Analytics
- **Environment**: Production-ready with environment variables

## 🔧 Installation

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager
- PostgreSQL database access

### **Setup Steps**

1. **Clone the repository**
   ```bash
   git clone https://github.com/sushanshetty1/invista.git
   cd invista
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Neon Database (Business Data)
   NEON_DATABASE_URL="postgresql://user:password@host:5432/neondb"
   
   # Supabase Database (Authentication)
   SUPABASE_DATABASE_URL="postgresql://postgres:password@host:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma clients for both databases
   npm run db:generate
   
   # Run migrations for both databases
   npm run db:migrate:neon
   npm run db:migrate:supabase
   
   # Seed sample data (optional)
   npx tsx scripts/seed-inventory.ts
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

### **Neon Database (Business Logic)**

#### **Core Models**
- **Product**: Main product catalog with SKU, pricing, and inventory settings
- **Category**: Hierarchical product categorization
- **Brand**: Product brand management
- **ProductVariant**: Product variations (size, color, etc.)
- **Supplier**: Supplier directory and information
- **Warehouse**: Warehouse locations and details

#### **Inventory Models**
- **InventoryItem**: Stock levels per product per warehouse
- **InventoryMovement**: Complete audit trail of stock changes
- **StockTransfer**: Inter-warehouse stock transfers
- **StockReservation**: Reserved stock for orders

#### **Supply Chain Models**
- **ProductSupplier**: Product-supplier relationships
- **PurchaseOrder**: Purchase order management
- **PurchaseOrderItem**: Line items for purchase orders
- **GoodsReceipt**: Received goods tracking

### **Supabase Database (Authentication)**

#### **User Management**
- **User**: Complete user profiles with preferences
- **UserSession**: Session tracking and management
- **LoginHistory**: Login attempt history
- **UserPreferences**: Theme, timezone, and UI settings

## 🔐 Authentication

### **Supported Methods**
- **Email/Password**: Traditional authentication with secure password handling
- **Google OAuth**: Seamless Google account integration
- **Session Management**: Persistent sessions with automatic refresh

### **Security Features**
- **Password Reset**: Secure password reset via email
- **Account Verification**: Email verification for new accounts
- **Two-Factor Authentication**: Ready for 2FA implementation
- **Login History**: Track login attempts and devices

### **User Flow**
1. User visits landing page
2. Chooses authentication method (email/Google)
3. Completes authentication process
4. Redirected to dashboard
5. Profile creation if new user
6. Session maintained across browser sessions

## 🎯 Current Functionality

### **✅ Fully Implemented Features**

#### **1. Landing Page**
- Modern, responsive landing page
- Feature showcase with animations
- Authentication CTAs
- Auto-redirect for logged-in users

#### **2. Authentication System**
- Complete login/signup flow
- Google OAuth integration
- Password reset functionality
- Account deletion capability
- Profile management

#### **3. Dashboard**
- Real-time inventory statistics
- Interactive charts and graphs
- Recent activity feed
- Key performance indicators
- Quick action buttons

#### **4. Inventory Management**
- Product catalog with search and filters
- Category management with hierarchy
- Brand management
- Stock level tracking
- Product form dialogs

#### **5. Stock Management**
- Real-time stock levels
- Stock movement history
- Warehouse-based inventory
- Low stock alerts
- Stock adjustment dialogs

#### **6. Supplier Management**
- Supplier directory
- Contact information management
- Performance metrics display
- Search and filtering capabilities

#### **7. User Profile**
- Complete profile editing
- Theme preferences (dark/light/system)
- Account settings
- Security options
- Account deletion

### **🚧 Partially Implemented**

#### **Stock Operations**
- Stock adjustment dialogs (UI ready, backend pending)
- Stock transfer between warehouses (UI ready)
- Bulk stock operations (UI framework ready)

#### **Purchase Orders**
- Basic supplier-product relationships exist
- Purchase order data models defined
- UI components partially implemented

#### **Advanced Reporting**
- Chart components implemented
- Data visualization ready
- Advanced analytics framework in place

## 📱 User Interface

### **Design System**
- **Component Library**: Custom components based on Radix UI
- **Typography**: Space Grotesk font family
- **Color System**: Semantic color tokens with dark/light variants
- **Icons**: Lucide React icon library
- **Animations**: Smooth transitions and micro-interactions

### **Layout Structure**
- **Navigation**: Fixed navigation bar with user menu
- **Sidebar**: Contextual sidebar for different sections
- **Main Content**: Responsive content areas with proper spacing
- **Footer**: Site footer with links and information

### **Interactive Elements**
- **Data Tables**: Advanced tables with sorting, filtering, pagination
- **Forms**: Validated forms with real-time feedback
- **Dialogs**: Modal dialogs for CRUD operations
- **Dropdowns**: Context menus and action dropdowns
- **Charts**: Interactive charts with hover states

### **Responsive Design**
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Perfect tablet experience
- **Desktop**: Full desktop functionality
- **Grid System**: Flexible CSS Grid and Flexbox layouts

## 🔌 API Endpoints

### **Inventory API**

#### **Products**
- `GET /api/inventory/products` - List products with filtering
- `POST /api/inventory/products` - Create new product
- `GET /api/inventory/products/[id]` - Get product details
- `PUT /api/inventory/products/[id]` - Update product
- `DELETE /api/inventory/products/[id]` - Delete product

#### **Categories**
- `GET /api/inventory/categories` - List categories
- `POST /api/inventory/categories` - Create category
- `PUT /api/inventory/categories/[id]` - Update category
- `DELETE /api/inventory/categories/[id]` - Delete category

#### **Stock Management**
- `GET /api/inventory/stock` - List inventory items
- `POST /api/inventory/stock` - Create/adjust stock
- `GET /api/inventory/stock/movements` - Stock movement history

#### **Suppliers**
- `GET /api/inventory/suppliers` - List suppliers
- `POST /api/inventory/suppliers` - Create supplier
- `PUT /api/inventory/suppliers/[id]` - Update supplier

### **API Features**
- **Rate Limiting**: Request rate limiting for security
- **Validation**: Zod schema validation for all inputs
- **Error Handling**: Comprehensive error responses
- **Pagination**: Cursor-based pagination for large datasets
- **Filtering**: Advanced filtering and search capabilities

## 🎨 UI Components

### **Core Components**
- **Button**: Various button variants and sizes
- **Input**: Form inputs with validation states
- **Select**: Dropdown selects with search
- **Table**: Advanced data tables with sorting
- **Card**: Content cards with headers and actions
- **Dialog**: Modal dialogs for forms and confirmations

### **Inventory Components**
- **ProductFormDialog**: Product creation/editing
- **CategoryManager**: Category hierarchy management
- **StockAdjustmentDialog**: Stock level adjustments
- **InventoryAnalytics**: Charts and statistics
- **LowStockAlerts**: Alert components for low stock

### **Chart Components**
- **AreaChart**: Trend visualization
- **BarChart**: Comparative data display
- **PieChart**: Category breakdowns
- **LineChart**: Time series data
- **StockHistoryChart**: Inventory level history

## 📈 Analytics & Reporting

### **Dashboard Metrics**
- **Total Products**: Complete product count
- **Active Products**: Currently active inventory
- **Low Stock Items**: Products below minimum threshold
- **Stock Value**: Total inventory value
- **Active Suppliers**: Supplier count
- **Recent Movements**: Recent inventory transactions

### **Inventory Analytics**
- **Stock Level Trends**: Historical stock movements
- **Category Performance**: Sales and inventory by category
- **Supplier Performance**: Delivery and quality metrics
- **Movement Analysis**: In/out/adjustment tracking
- **Value Tracking**: Inventory value over time

### **Real-time Updates**
- **Live Data**: Real-time inventory updates
- **Automatic Refresh**: Periodic data refresh
- **Change Notifications**: Instant updates for critical changes
- **Alert System**: Proactive notifications for issues

## 🛠️ Development

### **Project Structure**
```
invista/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── inventory/         # Inventory management pages
│   └── profile/           # User profile
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components
│   └── inventory/        # Inventory-specific components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── actions/          # Server actions
│   └── validations/      # Zod schemas
├── prisma/               # Database schemas
│   ├── schema-neon.prisma
│   └── schema-supabase.prisma
└── scripts/              # Database seeding scripts
```

### **Development Scripts**
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Database Management
npm run db:generate            # Generate Prisma clients
npm run db:migrate:neon        # Run Neon DB migrations
npm run db:migrate:supabase    # Run Supabase DB migrations
npm run db:studio:neon         # Open Neon Prisma Studio
npm run db:studio:supabase     # Open Supabase Prisma Studio

# Code Quality
npm run lint                   # Run ESLint
npm run type-check             # TypeScript type checking
```

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting (configured)
- **Conventional Commits**: Standardized commit messages

### **Testing**
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User flow testing
- **Database Tests**: Migration and seed testing

---

## 🎉 **Getting Started**

1. **Visit the live demo**: [https://invista-dbms.vercel.app](https://invista-dbms.vercel.app)
2. **Sign up** with email or Google account
3. **Explore the dashboard** to see real-time inventory data
4. **Navigate to inventory sections** to manage products, stock, and suppliers
5. **Customize your profile** and preferences

## 🤝 **Contributing**

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 **Team**

**Team Invista** - Modern inventory management solutions
- GitHub: [@sushanshetty1](https://github.com/sushanshetty1)

---

<div align="center">
  <strong>Built with ❤️ for modern inventory management</strong>
</div>
