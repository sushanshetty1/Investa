# Invista API Documentation

## Overview

The Invista API provides comprehensive endpoints for managing inventory, products, suppliers, and related operations. This RESTful API is built with Next.js and includes features like:

- **Type-safe validation** with Zod schemas
- **Rate limiting** for security
- **Server actions** for optimistic updates
- **Comprehensive error handling**
- **Authentication and authorization**
- **CORS support**

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API supports two authentication methods:

### 1. JWT Bearer Token (for web app)
```bash
Authorization: Bearer <jwt_token>
```

### 2. API Key (for external integrations)
```bash
X-API-Key: <api_key>
```

## Rate Limiting

- **Read operations**: 100-200 requests per minute per IP
- **Write operations**: 20-30 requests per minute per IP  
- **Delete operations**: 10 requests per minute per IP

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "data": {
    "field": "validation error details"
  }
}
```

## Endpoints

### Products

#### List Products
```
GET /api/inventory/products
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `search` (string) - Search in name, SKU, barcode
- `categoryId` (UUID) - Filter by category
- `brandId` (UUID) - Filter by brand
- `status` (enum) - ACTIVE, INACTIVE, DISCONTINUED, DRAFT
- `sortBy` (enum) - name, sku, createdAt, updatedAt
- `sortOrder` (enum) - asc, desc

**Example Request:**
```bash
GET /api/inventory/products?page=1&limit=20&search=laptop&status=ACTIVE
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "MacBook Pro",
        "sku": "MBP-001",
        "description": "Apple MacBook Pro 13-inch",
        "status": "ACTIVE",
        "sellingPrice": 1299.99,
        "costPrice": 1000.00,
        "category": {
          "id": "uuid",
          "name": "Laptops"
        },
        "brand": {
          "id": "uuid",
          "name": "Apple"
        },
        "variants": [...],
        "inventoryItems": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

#### Create Product
```
POST /api/inventory/products
```

**Request Body:**
```json
{
  "name": "Product Name",
  "sku": "PROD-001",
  "description": "Product description",
  "categoryId": "uuid",
  "brandId": "uuid",
  "costPrice": 100.00,
  "sellingPrice": 150.00,
  "minStockLevel": 10,
  "reorderPoint": 5,
  "weight": 1.5,
  "dimensions": {
    "length": 10,
    "width": 5,
    "height": 2,
    "unit": "cm"
  },
  "status": "ACTIVE",
  "isTrackable": true,
  "tags": ["electronics", "gadget"]
}
```

#### Get Single Product
```
GET /api/inventory/products/{id}
```

#### Update Product
```
PUT /api/inventory/products/{id}
```

#### Delete Product
```
DELETE /api/inventory/products/{id}
```

### Suppliers

#### List Suppliers
```
GET /api/inventory/suppliers
```

**Query Parameters:**
- `page`, `limit`, `search` - Same as products
- `status` - ACTIVE, INACTIVE, PENDING_APPROVAL, SUSPENDED, BLACKLISTED
- `companyType` - CORPORATION, LLC, PARTNERSHIP, etc.
- `sortBy` - name, code, createdAt, updatedAt, rating

#### Create Supplier
```
POST /api/inventory/suppliers
```

**Request Body:**
```json
{
  "name": "Supplier Name",
  "code": "SUP-001",
  "email": "contact@supplier.com",
  "phone": "+1234567890",
  "website": "https://supplier.com",
  "companyType": "CORPORATION",
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "contactName": "John Doe",
  "contactEmail": "john@supplier.com",
  "paymentTerms": "NET30",
  "currency": "USD",
  "status": "ACTIVE"
}
```

### Inventory/Stock

#### List Inventory
```
GET /api/inventory/stock
```

**Query Parameters:**
- `page`, `limit`, `search` - Standard pagination
- `warehouseId` (UUID) - Filter by warehouse
- `productId` (UUID) - Filter by product
- `categoryId` (UUID) - Filter by product category
- `brandId` (UUID) - Filter by product brand
- `status` - AVAILABLE, RESERVED, QUARANTINE, DAMAGED, EXPIRED, RECALLED
- `lowStock` (boolean) - Show only low stock items
- `alerts=true` - Get low stock alerts

**Special Endpoint - Low Stock Alerts:**
```
GET /api/inventory/stock?alerts=true
```

#### Stock Operations
```
POST /api/inventory/stock
```

**Stock Adjustment:**
```json
{
  "operation": "adjust",
  "productId": "uuid",
  "warehouseId": "uuid",
  "adjustmentType": "INCREASE", // or DECREASE, SET
  "quantity": 10,
  "reason": "Inventory count correction",
  "notes": "Annual inventory audit"
}
```

**Stock Transfer:**
```json
{
  "operation": "transfer",
  "fromWarehouseId": "uuid",
  "toWarehouseId": "uuid",
  "productId": "uuid",
  "quantity": 5,
  "reason": "Store replenishment",
  "notes": "Transfer for new store opening"
}
```

### Stock Movements

#### List Stock Movements
```
GET /api/inventory/stock/movements
```

**Query Parameters:**
- `page`, `limit` - Standard pagination
- `productId` (UUID) - Filter by product
- `warehouseId` (UUID) - Filter by warehouse
- `type` - RECEIPT, SHIPMENT, ADJUSTMENT, TRANSFER_OUT, TRANSFER_IN, etc.
- `dateFrom` (ISO date) - Start date filter
- `dateTo` (ISO date) - End date filter
- `sortBy` - occurredAt, quantity, type

## Server Actions

For the web application, server actions provide a more efficient way to interact with the backend:

### Product Actions
```typescript
import { createProduct, updateProduct, deleteProduct, getProducts } from '@/lib/actions/products'

// Create product
const result = await createProduct({
  name: "New Product",
  sku: "PROD-001",
  // ... other fields
})

// Update product
const result = await updateProduct({
  id: "product-uuid",
  name: "Updated Name",
  // ... other fields
})
```

### Supplier Actions
```typescript
import { createSupplier, updateSupplier, getSuppliers } from '@/lib/actions/suppliers'
```

### Inventory Actions
```typescript
import { adjustStock, transferStock, getInventory } from '@/lib/actions/inventory'
```

## Error Handling

### Common Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate SKU, etc.)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Validation Errors

When validation fails, the API returns detailed error information:

```json
{
  "success": false,
  "error": "Validation failed",
  "data": [
    {
      "field": "name",
      "message": "Product name is required"
    },
    {
      "field": "sku",
      "message": "SKU must be unique"
    }
  ]
}
```

## Security

### Headers
All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: ...`

### Input Sanitization
All user inputs are sanitized to prevent XSS attacks.

### CORS
CORS is configured to allow requests from authorized origins.

## Examples

### Create a Complete Product with Inventory

```javascript
// 1. Create the product
const productResult = await fetch('/api/inventory/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    name: 'Gaming Laptop',
    sku: 'LAPTOP-GAMING-001',
    description: 'High-performance gaming laptop',
    categoryId: 'electronics-category-uuid',
    brandId: 'brand-uuid',
    costPrice: 800.00,
    sellingPrice: 1200.00,
    minStockLevel: 5,
    reorderPoint: 10
  })
})

const product = await productResult.json()

// 2. Add initial stock
const stockResult = await fetch('/api/inventory/stock', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    operation: 'adjust',
    productId: product.data.id,
    warehouseId: 'main-warehouse-uuid',
    adjustmentType: 'SET',
    quantity: 25,
    reason: 'Initial stock'
  })
})
```

### Get Low Stock Alerts

```javascript
const response = await fetch('/api/inventory/stock?alerts=true', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
})

const lowStockItems = await response.json()
```

## SDKs and Client Libraries

### JavaScript/TypeScript Client

```typescript
class InvistaAPIClient {
  constructor(private baseURL: string, private apiKey: string) {}
  
  async getProducts(params?: ProductQueryParams) {
    const url = new URL(`${this.baseURL}/inventory/products`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value))
      })
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': this.apiKey
      }
    })
    
    return response.json()
  }
  
  // ... other methods
}

// Usage
const client = new InvistaAPIClient('http://localhost:3000/api', 'your-api-key')
const products = await client.getProducts({ page: 1, limit: 20 })
```

## Webhooks

The API supports webhooks for real-time notifications:

### Available Events
- `product.created`
- `product.updated`
- `product.deleted`
- `stock.low_alert`
- `stock.adjusted`
- `transfer.completed`

### Webhook Configuration
Configure webhooks in your dashboard or via API:

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["product.created", "stock.low_alert"],
  "secret": "webhook-secret"
}
```

## Testing

### Test Data
Use the following test credentials for development:

**JWT Token:** `dev-token`
**API Key:** `dev-api-key`

### Postman Collection
A Postman collection is available for testing all endpoints: [Download Collection](./invista-api.postman_collection.json)

## Support

For API support, contact the development team or check our documentation at [docs.invista.com](https://docs.invista.com).

## New API Endpoints Added

### Documentation and Health Check
- **GET /api/docs** - Interactive Swagger UI documentation
- **GET /api/docs?format=json** - OpenAPI 3.0 specification in JSON format
- **GET /api/health** - Basic health check
- **GET /api/health?check=full** - Extended health check with database connectivity

### OpenAPI/Swagger Documentation
The API now includes comprehensive OpenAPI 3.0 specification with:
- Complete schema definitions for all entities
- Detailed endpoint documentation
- Request/response examples
- Authentication and security information
- Interactive Swagger UI for testing endpoints

Access the documentation at: `http://localhost:3000/api/docs`

## Implementation Status

### ✅ Completed
- **Server Actions**: Complete CRUD operations for all entities with validation and error handling
- **API Routes**: All major endpoints implemented with rate limiting and standardized responses
- **Validation**: Comprehensive Zod schemas for all entities matching database schema
- **Error Handling**: Consistent error responses and logging
- **Rate Limiting**: Memory-based rate limiting implementation
- **CORS Support**: Cross-origin request handling
- **OpenAPI Documentation**: Complete specification with Swagger UI
- **Health Checks**: API monitoring and status endpoints

### 🔄 In Progress / Next Steps
- **Authentication Integration**: JWT/API key validation in route handlers (placeholder comments added)
- **Database Optimization**: Query optimization and caching strategies
- **Frontend Integration**: UI components to consume the API endpoints
- **Testing**: Comprehensive API endpoint testing
- **Production Deployment**: Environment-specific configurations

### 📋 API Coverage

| Entity | List | Create | Read | Update | Delete | Actions |
|--------|------|--------|------|--------|--------|---------|
| Products | ✅ | ✅ | ✅ | ✅ | ✅ | Bulk operations |
| Categories | ✅ | ✅ | ✅ | ✅ | ✅ | Tree operations |
| Brands | ✅ | ✅ | ✅ | ✅ | ✅ | Basic CRUD |
| Warehouses | ✅ | ✅ | ✅ | ✅ | ✅ | Basic CRUD |
| Suppliers | ✅ | ✅ | ✅ | ✅ | ✅ | Contact management |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ | Stock adjustments |
| Stock Movements | ✅ | ✅ | ✅ | ✅ | ✅ | Transfer operations |
