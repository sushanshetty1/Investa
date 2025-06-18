// Database setup and seeding script for Invista Inventory Management System
// This script will create initial data for testing the inventory management features

import { neonClient } from '@/lib/db'

async function seedInventoryData() {
  try {
    console.log('Starting database seeding...')

    // Create sample categories
    const categories = await Promise.all([
      neonClient.category.create({
        data: {
          name: 'Electronics',
          description: 'Electronic devices and components',
          slug: 'electronics',
          level: 0,
          path: '/electronics',
          icon: '💻',
          color: '#3b82f6',
          isActive: true
        }
      }),
      neonClient.category.create({
        data: {
          name: 'Computer Accessories',
          description: 'Accessories for computers and laptops',
          slug: 'computer-accessories',
          level: 1,
          path: '/electronics/computer-accessories',
          parentId: undefined, // Will be set after electronics category is created
          isActive: true
        }
      }),
      neonClient.category.create({
        data: {
          name: 'Office Supplies',
          description: 'General office and business supplies',
          slug: 'office-supplies',
          level: 0,
          path: '/office-supplies',
          icon: '📋',
          color: '#10b981',
          isActive: true
        }
      })
    ])

    // Update computer accessories parent
    await neonClient.category.update({
      where: { id: categories[1].id },
      data: { parentId: categories[0].id }
    })

    // Create sample brands
    const brands = await Promise.all([
      neonClient.brand.create({
        data: {
          name: 'TechPro',
          description: 'Professional technology accessories',
          website: 'https://techpro.com',
          contactEmail: 'info@techpro.com',
          isActive: true
        }
      }),
      neonClient.brand.create({
        data: {
          name: 'OfficeMax',
          description: 'Quality office supplies and equipment',
          website: 'https://officemax.com',
          contactEmail: 'sales@officemax.com',
          isActive: true
        }
      })
    ])

    // Create sample warehouses
    const warehouses = await Promise.all([
      neonClient.warehouse.create({
        data: {
          name: 'Main Warehouse',
          code: 'WH-MAIN',
          description: 'Primary storage facility',
          address: {
            street: '123 Industrial Blvd',
            city: 'San Francisco',
            state: 'CA',
            country: 'United States',
            zipCode: '94105'
          },
          type: 'STANDARD',
          managerName: 'John Smith',
          managerEmail: 'john.smith@company.com',
          managerPhone: '+1-555-0123',
          isActive: true
        }
      }),
      neonClient.warehouse.create({
        data: {
          name: 'Distribution Center',
          code: 'WH-DIST',
          description: 'Distribution and fulfillment center',
          address: {
            street: '456 Logistics Ave',
            city: 'Los Angeles',
            state: 'CA',
            country: 'United States',
            zipCode: '90210'
          },
          type: 'DISTRIBUTION_CENTER',
          managerName: 'Jane Doe',
          managerEmail: 'jane.doe@company.com',
          managerPhone: '+1-555-0124',
          isActive: true
        }
      })
    ])

    // Create sample suppliers
    const suppliers = await Promise.all([
      neonClient.supplier.create({
        data: {
          name: 'TechSupply Pro',
          code: 'TSP-001',
          email: 'orders@techsupplypro.com',
          phone: '+1-555-0123',
          website: 'https://techsupplypro.com',
          companyType: 'CORPORATION',
          taxId: '12-3456789',
          billingAddress: {
            street: '123 Technology Ave',
            city: 'San Francisco',
            state: 'CA',
            country: 'United States',
            zipCode: '94105'
          },
          contactName: 'John Smith',
          contactEmail: 'john.smith@techsupplypro.com',
          contactPhone: '+1-555-0124',
          contactTitle: 'Sales Manager',
          paymentTerms: 'NET30',
          creditLimit: 50000,
          currency: 'USD',
          rating: 4.8,
          onTimeDelivery: 95.5,
          qualityRating: 4.7,
          status: 'ACTIVE',
          createdBy: 'system'
        }
      }),
      neonClient.supplier.create({
        data: {
          name: 'Global Office Solutions',
          code: 'GOS-001',
          email: 'sales@globaloffice.com',
          phone: '+1-555-0125',
          website: 'https://globaloffice.com',
          companyType: 'LLC',
          billingAddress: {
            street: '789 Business Blvd',
            city: 'New York',
            state: 'NY',
            country: 'United States',
            zipCode: '10001'
          },
          contactName: 'Sarah Johnson',
          contactEmail: 'sarah.johnson@globaloffice.com',
          contactPhone: '+1-555-0126',
          contactTitle: 'Account Manager',
          paymentTerms: 'NET15',
          creditLimit: 25000,
          currency: 'USD',
          rating: 4.5,
          onTimeDelivery: 92.3,
          qualityRating: 4.4,
          status: 'ACTIVE',
          createdBy: 'system'
        }
      })
    ])

    // Create sample products
    const products = await Promise.all([
      neonClient.product.create({
        data: {
          name: 'Premium Laptop Stand',
          description: 'Adjustable aluminum laptop stand with cooling vents and ergonomic design',
          sku: 'LPS-001',
          barcode: '1234567890123',
          categoryId: categories[1].id, // Computer Accessories
          brandId: brands[0].id, // TechPro
          costPrice: 45.99,
          sellingPrice: 89.99,
          wholesalePrice: 65.99,
          minStockLevel: 20,
          maxStockLevel: 200,
          reorderPoint: 30,
          reorderQuantity: 50,
          weight: 1.2,
          dimensions: {
            length: 30,
            width: 25,
            height: 15,
            unit: 'cm'
          },
          color: 'Silver',
          material: 'Aluminum',
          status: 'ACTIVE',
          isTrackable: true,
          isSerialized: false,
          leadTimeSupply: 14,
          tags: ['laptop', 'stand', 'ergonomic', 'aluminum'],
          createdBy: 'system'
        }
      }),
      neonClient.product.create({
        data: {
          name: 'Wireless Optical Mouse',
          description: 'Ergonomic wireless mouse with precision optical sensor',
          sku: 'WM-001',
          barcode: '1234567890124',
          categoryId: categories[1].id, // Computer Accessories
          brandId: brands[0].id, // TechPro
          costPrice: 15.99,
          sellingPrice: 29.99,
          wholesalePrice: 22.99,
          minStockLevel: 50,
          maxStockLevel: 500,
          reorderPoint: 75,
          reorderQuantity: 100,
          weight: 0.15,
          dimensions: {
            length: 12,
            width: 7,
            height: 4,
            unit: 'cm'
          },
          color: 'Black',
          material: 'Plastic',
          status: 'ACTIVE',
          isTrackable: true,
          isSerialized: false,
          leadTimeSupply: 7,
          tags: ['mouse', 'wireless', 'optical'],
          createdBy: 'system'
        }
      }),
      neonClient.product.create({
        data: {
          name: 'USB-C Multi-Port Hub',
          description: '7-in-1 USB-C hub with HDMI, USB 3.0, and card readers',
          sku: 'UCH-001',
          barcode: '1234567890125',
          categoryId: categories[1].id, // Computer Accessories
          brandId: brands[0].id, // TechPro
          costPrice: 25.99,
          sellingPrice: 49.99,
          wholesalePrice: 37.99,
          minStockLevel: 30,
          maxStockLevel: 300,
          reorderPoint: 45,
          reorderQuantity: 75,
          weight: 0.25,
          dimensions: {
            length: 15,
            width: 8,
            height: 2,
            unit: 'cm'
          },
          color: 'Space Gray',
          material: 'Aluminum',
          status: 'ACTIVE',
          isTrackable: true,
          isSerialized: false,
          leadTimeSupply: 10,
          tags: ['usb-c', 'hub', 'multiport'],
          createdBy: 'system'
        }
      })
    ])

    // Create initial inventory items
    await Promise.all([
      // Laptop Stand inventory
      neonClient.inventoryItem.create({
        data: {
          productId: products[0].id,
          warehouseId: warehouses[0].id,
          quantity: 125,
          reservedQuantity: 0,
          availableQuantity: 125,
          averageCost: 45.99,
          lastCost: 47.50,
          status: 'AVAILABLE',
          qcStatus: 'PASSED',
          locationCode: 'A-1-5-B'
        }
      }),
      neonClient.inventoryItem.create({
        data: {
          productId: products[0].id,
          warehouseId: warehouses[1].id,
          quantity: 75,
          reservedQuantity: 5,
          availableQuantity: 70,
          averageCost: 45.99,
          lastCost: 47.50,
          status: 'AVAILABLE',
          qcStatus: 'PASSED',
          locationCode: 'B-2-3-A'
        }
      }),
      // Wireless Mouse inventory (low stock scenario)
      neonClient.inventoryItem.create({
        data: {
          productId: products[1].id,
          warehouseId: warehouses[0].id,
          quantity: 8,
          reservedQuantity: 3,
          availableQuantity: 5,
          averageCost: 15.99,
          lastCost: 16.50,
          status: 'AVAILABLE',
          qcStatus: 'PASSED',
          locationCode: 'A-2-1-C'
        }
      }),
      // USB-C Hub inventory (out of stock scenario)
      neonClient.inventoryItem.create({
        data: {
          productId: products[2].id,
          warehouseId: warehouses[0].id,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          averageCost: 25.99,
          lastCost: 27.00,
          status: 'AVAILABLE',
          qcStatus: 'PASSED',
          locationCode: 'A-3-2-A'
        }
      })
    ])

    // Create supplier-product relationships
    await Promise.all([
      neonClient.productSupplier.create({
        data: {
          productId: products[0].id,
          supplierId: suppliers[0].id,
          supplierSku: 'TSP-LPS-001',
          supplierName: 'Premium Laptop Stand - Silver',
          unitCost: 45.99,
          currency: 'USD',
          minOrderQty: 10,
          leadTimeDays: 14,
          isPreferred: true,
          isActive: true
        }
      }),
      neonClient.productSupplier.create({
        data: {
          productId: products[1].id,
          supplierId: suppliers[0].id,
          supplierSku: 'TSP-WM-001',
          supplierName: 'Wireless Optical Mouse - Black',
          unitCost: 15.99,
          currency: 'USD',
          minOrderQty: 25,
          leadTimeDays: 7,
          isPreferred: true,
          isActive: true
        }
      }),
      neonClient.productSupplier.create({
        data: {
          productId: products[2].id,
          supplierId: suppliers[0].id,
          supplierSku: 'TSP-UCH-001',
          supplierName: 'USB-C Multi-Port Hub - Space Gray',
          unitCost: 25.99,
          currency: 'USD',
          minOrderQty: 20,
          leadTimeDays: 10,
          isPreferred: true,
          isActive: true
        }
      })
    ])

    // Create some sample stock movements
    await Promise.all([
      neonClient.inventoryMovement.create({
        data: {
          type: 'RECEIPT',
          productId: products[0].id,
          warehouseId: warehouses[0].id,
          quantity: 50,
          quantityBefore: 75,
          quantityAfter: 125,
          unitCost: 47.50,
          totalCost: 2375.00,
          referenceType: 'PURCHASE_ORDER',
          referenceId: 'PO-2024-001',
          reason: 'Purchase order delivery',
          userId: 'system'
        }
      }),
      neonClient.inventoryMovement.create({
        data: {
          type: 'SHIPMENT',
          productId: products[1].id,
          warehouseId: warehouses[0].id,
          quantity: 15,
          quantityBefore: 23,
          quantityAfter: 8,
          referenceType: 'ORDER',
          referenceId: 'ORD-2024-001',
          reason: 'Customer order fulfillment',
          userId: 'system'
        }
      }),
      neonClient.inventoryMovement.create({
        data: {
          type: 'SHIPMENT',
          productId: products[2].id,
          warehouseId: warehouses[0].id,
          quantity: 25,
          quantityBefore: 25,
          quantityAfter: 0,
          referenceType: 'ORDER',
          referenceId: 'ORD-2024-002',
          reason: 'Bulk order fulfillment',
          userId: 'system'
        }
      })
    ])

    console.log('Database seeding completed successfully!')
    console.log('Created:')
    console.log(`- ${categories.length} categories`)
    console.log(`- ${brands.length} brands`)
    console.log(`- ${warehouses.length} warehouses`)
    console.log(`- ${suppliers.length} suppliers`)
    console.log(`- ${products.length} products`)
    console.log('- Sample inventory items and movements')

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await neonClient.$disconnect()
  }
}

// Export the function for use in scripts
export { seedInventoryData }

// If running directly
if (require.main === module) {
  seedInventoryData()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
