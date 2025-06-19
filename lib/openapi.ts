/**
 * OpenAPI/Swagger Documentation Generator for Invista API
 * 
 * This utility generates comprehensive OpenAPI 3.0 specification
 * for all inventory management API endpoints.
 */

export interface OpenAPIInfo {
  title: string
  version: string
  description: string
  contact?: {
    name: string
    email: string
    url?: string
  }
  license?: {
    name: string
    url?: string
  }
}

export interface OpenAPIServer {
  url: string
  description: string
}

/**
 * Generate complete OpenAPI specification for the Invista API
 */
export function generateOpenAPISpec(info: OpenAPIInfo = {
  title: "Invista API",
  version: "1.0.0",
  description: "Comprehensive inventory management API for products, suppliers, warehouses, and stock tracking",
  contact: {
    name: "Invista API Team",
    email: "api@invista.com"
  }
}): Record<string, unknown> {
  const servers: OpenAPIServer[] = [
    {
      url: "http://localhost:3000/api",
      description: "Development server"
    },
    {
      url: "https://api.invista.com",
      description: "Production server"
    }
  ]

  const components: Record<string, unknown> = {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token for web application authentication"
      },
      apiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        description: "API key for external integrations"
      }
    },
    schemas: {
      // Common schemas
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Error message" },
          data: { type: "object" }
        },
        required: ["success", "error"]
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          message: { type: "string", example: "Operation completed successfully" }
        },
        required: ["success", "data"]
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, example: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, example: 20 },
          total: { type: "integer", minimum: 0, example: 100 },
          totalPages: { type: "integer", minimum: 0, example: 5 }
        },
        required: ["page", "limit", "total", "totalPages"]
      },

      // Product schemas
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "MacBook Pro 13-inch" },
          description: { type: "string", example: "Apple MacBook Pro with M2 chip" },
          sku: { type: "string", example: "MBP-001" },
          barcode: { type: "string", example: "1234567890123" },
          categoryId: { type: "string", format: "uuid", nullable: true },
          brandId: { type: "string", format: "uuid", nullable: true },
          costPrice: { type: "number", format: "decimal", example: 1000.00 },
          sellingPrice: { type: "number", format: "decimal", example: 1299.99 },
          minStockLevel: { type: "integer", minimum: 0, example: 5 },
          reorderPoint: { type: "integer", minimum: 0, example: 10 },
          status: { 
            type: "string", 
            enum: ["ACTIVE", "INACTIVE", "DISCONTINUED", "DRAFT"],
            example: "ACTIVE"
          },
          isTrackable: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["id", "name", "sku", "status"]
      },
      CreateProduct: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200, example: "MacBook Pro 13-inch" },
          description: { type: "string", example: "Apple MacBook Pro with M2 chip" },
          sku: { type: "string", minLength: 1, maxLength: 50, example: "MBP-001" },
          barcode: { type: "string", example: "1234567890123" },
          categoryId: { type: "string", format: "uuid" },
          brandId: { type: "string", format: "uuid" },
          costPrice: { type: "number", format: "decimal", minimum: 0, example: 1000.00 },
          sellingPrice: { type: "number", format: "decimal", minimum: 0, example: 1299.99 },
          minStockLevel: { type: "integer", minimum: 0, default: 0, example: 5 },
          reorderPoint: { type: "integer", minimum: 0, example: 10 },
          status: { 
            type: "string", 
            enum: ["ACTIVE", "INACTIVE", "DISCONTINUED", "DRAFT"],
            default: "ACTIVE"
          },
          isTrackable: { type: "boolean", default: true }
        },
        required: ["name", "sku"]
      },

      // Category schemas
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Electronics" },
          description: { type: "string", example: "Electronic devices and gadgets" },
          slug: { type: "string", example: "electronics" },
          parentId: { type: "string", format: "uuid", nullable: true },
          level: { type: "integer", minimum: 0, example: 0 },
          path: { type: "string", example: "/electronics" },
          icon: { type: "string", example: "📱" },
          color: { type: "string", pattern: "^#[0-9A-F]{6}$", example: "#3B82F6" },
          image: { type: "string", format: "uri", example: "https://example.com/image.jpg" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["id", "name", "slug", "level", "isActive"]
      },
      CreateCategory: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200, example: "Electronics" },
          description: { type: "string", example: "Electronic devices and gadgets" },
          parentId: { type: "string", format: "uuid" },
          icon: { type: "string", example: "📱" },
          color: { type: "string", pattern: "^#[0-9A-F]{6}$", example: "#3B82F6" },
          image: { type: "string", format: "uri", example: "https://example.com/image.jpg" },
          isActive: { type: "boolean", default: true }
        },
        required: ["name"]
      },

      // Brand schemas
      Brand: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Apple" },
          description: { type: "string", example: "Technology company" },
          logo: { type: "string", format: "uri", example: "https://example.com/logo.png" },
          website: { type: "string", format: "uri", example: "https://apple.com" },
          contactEmail: { type: "string", format: "email", example: "contact@apple.com" },
          contactPhone: { type: "string", example: "+1-800-275-2273" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["id", "name", "isActive"]
      },
      CreateBrand: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200, example: "Apple" },
          description: { type: "string", example: "Technology company" },
          logo: { type: "string", format: "uri", example: "https://example.com/logo.png" },
          website: { type: "string", format: "uri", example: "https://apple.com" },
          contactEmail: { type: "string", format: "email", example: "contact@apple.com" },
          contactPhone: { type: "string", example: "+1-800-275-2273" },
          isActive: { type: "boolean", default: true }
        },
        required: ["name"]
      },

      // Warehouse schemas
      Warehouse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Main Warehouse" },
          code: { type: "string", example: "WH-001" },
          description: { type: "string", example: "Primary distribution center" },
          type: {
            type: "string",
            enum: ["STANDARD", "DISTRIBUTION_CENTER", "RETAIL_STORE", "FULFILLMENT_CENTER", "CROSS_DOCK", "COLD_STORAGE"],
            example: "STANDARD"
          },
          address: { $ref: "#/components/schemas/Address" },
          managerName: { type: "string", example: "John Doe" },
          managerEmail: { type: "string", format: "email", example: "john@example.com" },
          managerPhone: { type: "string", example: "+1234567890" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["id", "name", "code", "type", "address", "isActive"]
      },
      CreateWarehouse: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200, example: "Main Warehouse" },
          code: { type: "string", minLength: 1, maxLength: 50, example: "WH-001" },
          description: { type: "string", example: "Primary distribution center" },
          type: {
            type: "string",
            enum: ["STANDARD", "DISTRIBUTION_CENTER", "RETAIL_STORE", "FULFILLMENT_CENTER", "CROSS_DOCK", "COLD_STORAGE"],
            default: "STANDARD"
          },
          address: { $ref: "#/components/schemas/Address" },
          managerName: { type: "string", example: "John Doe" },
          managerEmail: { type: "string", format: "email", example: "john@example.com" },
          managerPhone: { type: "string", example: "+1234567890" },
          isActive: { type: "boolean", default: true }
        },
        required: ["name", "code", "address"]
      },

      // Supplier schemas
      Supplier: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "ACME Corporation" },
          code: { type: "string", example: "ACME-001" },
          email: { type: "string", format: "email", example: "contact@acme.com" },
          phone: { type: "string", example: "+1234567890" },
          website: { type: "string", format: "uri", example: "https://acme.com" },
          companyType: {
            type: "string",
            enum: ["CORPORATION", "LLC", "PARTNERSHIP", "SOLE_PROPRIETORSHIP", "NON_PROFIT", "GOVERNMENT", "OTHER"],
            example: "CORPORATION"
          },
          taxId: { type: "string", example: "12-3456789" },
          vatNumber: { type: "string", example: "US123456789" },
          billingAddress: { $ref: "#/components/schemas/Address" },
          shippingAddress: { $ref: "#/components/schemas/Address" },
          contactName: { type: "string", example: "John Smith" },
          contactEmail: { type: "string", format: "email", example: "john@acme.com" },
          contactPhone: { type: "string", example: "+1234567890" },
          contactTitle: { type: "string", example: "Sales Manager" },
          paymentTerms: { type: "string", example: "NET 30" },
          creditLimit: { type: "number", example: 50000 },
          currency: { type: "string", example: "USD" },
          rating: { type: "number", example: 4.5 },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "PENDING_APPROVAL", "SUSPENDED", "BLACKLISTED"],
            example: "ACTIVE"
          },
          certifications: { type: "array", items: { type: "string" } },
          notes: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["id", "name", "code", "status"]
      },
      CreateSupplier: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 255, example: "ACME Corporation" },
          code: { type: "string", minLength: 1, maxLength: 50, example: "ACME-001" },
          email: { type: "string", format: "email", example: "contact@acme.com" },
          phone: { type: "string", example: "+1234567890" },
          website: { type: "string", format: "uri", example: "https://acme.com" },
          companyType: {
            type: "string",
            enum: ["CORPORATION", "LLC", "PARTNERSHIP", "SOLE_PROPRIETORSHIP", "NON_PROFIT", "GOVERNMENT", "OTHER"]
          },
          taxId: { type: "string", example: "12-3456789" },
          vatNumber: { type: "string", example: "US123456789" },
          billingAddress: { $ref: "#/components/schemas/Address" },
          shippingAddress: { $ref: "#/components/schemas/Address" },
          contactName: { type: "string", example: "John Smith" },
          contactEmail: { type: "string", format: "email", example: "john@acme.com" },
          contactPhone: { type: "string", example: "+1234567890" },
          contactTitle: { type: "string", example: "Sales Manager" },
          paymentTerms: { type: "string", example: "NET 30" },
          creditLimit: { type: "number", minimum: 0, example: 50000 },
          currency: { type: "string", length: 3, default: "USD" },
          rating: { type: "number", minimum: 1, maximum: 5, example: 4.5 },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "PENDING_APPROVAL", "SUSPENDED", "BLACKLISTED"],
            default: "ACTIVE"
          },
          certifications: { type: "array", items: { type: "string" } },
          notes: { type: "string" }
        },
        required: ["name", "code", "billingAddress"]
      },

      // Address schema
      Address: {
        type: "object",
        properties: {
          street: { type: "string", minLength: 1, example: "123 Main St" },
          city: { type: "string", minLength: 1, example: "New York" },
          state: { type: "string", minLength: 1, example: "NY" },
          country: { type: "string", minLength: 1, example: "USA" },
          zipCode: { type: "string", minLength: 1, example: "10001" }
        },
        required: ["street", "city", "state", "country", "zipCode"]
      },

      // Inventory schemas
      InventoryItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          warehouseId: { type: "string", format: "uuid" },
          quantity: { type: "integer", minimum: 0, example: 25 },
          availableQuantity: { type: "integer", minimum: 0, example: 20 },
          reservedQuantity: { type: "integer", minimum: 0, example: 5 },
          status: {
            type: "string",
            enum: ["AVAILABLE", "RESERVED", "QUARANTINE", "DAMAGED", "EXPIRED", "RECALLED"],
            example: "AVAILABLE"
          },
          lastMovement: { type: "string", format: "date-time" },
          lastCost: { type: "number", format: "decimal", example: 100.00 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["id", "productId", "warehouseId", "quantity", "status"]
      },

      // Stock movement schemas
      StockAdjustment: {
        type: "object",
        properties: {
          productId: { type: "string", format: "uuid" },
          warehouseId: { type: "string", format: "uuid" },
          quantityChange: { type: "integer", example: 10 },
          reason: { type: "string", example: "Stock count adjustment" },
          notes: { type: "string", example: "Correcting inventory discrepancy" }
        },
        required: ["productId", "warehouseId", "quantityChange", "reason"]
      },

      StockMovement: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          warehouseId: { type: "string", format: "uuid" },
          type: {
            type: "string",
            enum: ["INBOUND", "OUTBOUND", "TRANSFER", "ADJUSTMENT", "RETURN", "DAMAGE", "LOSS"],
            example: "INBOUND"
          },
          quantity: { type: "integer", example: 100 },
          unitCost: { type: "number", format: "decimal", example: 25.50 },
          totalCost: { type: "number", format: "decimal", example: 2550.00 },
          reason: { type: "string", example: "Purchase order receipt" },
          referenceNumber: { type: "string", example: "PO-2024-001" },
          notes: { type: "string", example: "Initial stock receipt" },
          createdAt: { type: "string", format: "date-time" },
          updatedBy: { type: "string", format: "uuid" }
        },
        required: ["productId", "warehouseId", "type", "quantity"]
      }
    },
    responses: {
      BadRequest: {
        description: "Bad request - validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      },
      Unauthorized: {
        description: "Unauthorized - missing or invalid authentication",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      },
      RateLimit: {
        description: "Rate limit exceeded",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      },
      InternalError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      }
    }
  }

  const paths = {
    "/inventory/products": {
      get: {
        summary: "List products",
        description: "Retrieve a paginated list of products with optional filtering",
        operationId: "getProducts",
        tags: ["Products"],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            description: "Page number (1-based)",
            schema: { type: "integer", minimum: 1, default: 1 }
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Items per page (max 100)",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 }
          }
        ],
        responses: {
          "200": {
            description: "Products retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            products: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Product" }
                            },
                            pagination: { $ref: "#/components/schemas/Pagination" }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "429": { $ref: "#/components/responses/RateLimit" },
          "500": { $ref: "#/components/responses/InternalError" }
        },
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }]
      },
      post: {
        summary: "Create product",
        description: "Create a new product",
        operationId: "createProduct",
        tags: ["Products"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProduct" }
            }
          }
        },
        responses: {
          "200": {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Product" }
                      }
                    }
                  ]
                }
              }
            }
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimit" },
          "500": { $ref: "#/components/responses/InternalError" }
        },
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }]
      }
    }
  }

  return {
    openapi: "3.0.3",
    info,
    servers,
    paths,
    components,
    tags: [
      {
        name: "Products",
        description: "Product management operations"
      },
      {
        name: "Categories",
        description: "Product category management"
      },
      {
        name: "Brands",
        description: "Brand management operations"
      },
      {
        name: "Warehouses",
        description: "Warehouse and location management"
      },
      {
        name: "Suppliers",
        description: "Supplier management operations"
      },
      {
        name: "Inventory",
        description: "Stock level and inventory tracking"
      },
      {
        name: "Stock Movements",
        description: "Inventory movement tracking and history"
      }
    ],
    externalDocs: {
      description: "Find out more about Invista API",
      url: "https://docs.invista.com"
    }
  }
}

// Helper function to create Swagger UI HTML
export function generateSwaggerHTML(spec: Record<string, unknown>): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>Invista API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          spec: ${JSON.stringify(spec, null, 2)},
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout"
        })
      }
    </script>
  </body>
</html>`
}
