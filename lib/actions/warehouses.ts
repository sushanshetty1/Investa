'use server'

import { neonClient } from '@/lib/db'
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  warehouseQuerySchema,
  type CreateWarehouseInput,
  type UpdateWarehouseInput,
  type WarehouseQueryInput,
} from '@/lib/validations/warehouse'
import { actionSuccess, actionError, type ActionResponse } from '@/lib/api-utils'

// Get warehouses with filtering and pagination
export async function getWarehouses(input: WarehouseQueryInput): Promise<ActionResponse<{
  warehouses: unknown[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}>> {
  try {
    const validatedInput = warehouseQuerySchema.parse(input)
    const { page, limit, search, type, isActive, sortBy, sortOrder } = validatedInput

    const skip = (page - 1) * limit    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type !== undefined) {
      where.type = type
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }    // Build orderBy clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'code') {
      orderBy.code = sortOrder
    } else if (sortBy === 'type') {
      orderBy.type = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    }

    // Execute queries
    const [warehouses, total] = await Promise.all([
      neonClient.warehouse.findMany({
        where,
        include: {
          _count: {
            select: {
              inventoryItems: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      neonClient.warehouse.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return actionSuccess({
      warehouses,
      pagination: { page, limit, total, totalPages }
    }, `Retrieved ${warehouses.length} warehouses`)
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return actionError('Failed to fetch warehouses')
  }
}

// Get a single warehouse by ID
export async function getWarehouse(id: string): Promise<ActionResponse<unknown>> {
  try {
    const warehouse = await neonClient.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inventoryItems: true,
          }
        }
      }
    })

    if (!warehouse) {
      return actionError('Warehouse not found')
    }

    return actionSuccess(warehouse, 'Warehouse retrieved successfully')
  } catch (error) {
    console.error('Error fetching warehouse:', error)
    return actionError('Failed to fetch warehouse')
  }
}

// Create a new warehouse
export async function createWarehouse(input: CreateWarehouseInput): Promise<ActionResponse<unknown>> {
  try {
    const validatedInput = createWarehouseSchema.parse(input)
    const { name, code, description, type, address, contactName, contactEmail, contactPhone, isActive } = validatedInput

    // Check if warehouse code already exists
    const existingWarehouse = await neonClient.warehouse.findUnique({
      where: { code }
    })

    if (existingWarehouse) {
      return actionError('Warehouse with this code already exists')
    }

    const warehouse = await neonClient.warehouse.create({
      data: {
        name,
        code,
        description,
        type,
        address,
        managerName: contactName,
        managerEmail: contactEmail,
        managerPhone: contactPhone,
        isActive,
      },
      include: {
        _count: {
          select: {
            inventoryItems: true,
          }
        }
      }
    })

    return actionSuccess(warehouse, 'Warehouse created successfully')
  } catch (error) {
    console.error('Error creating warehouse:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return actionError('Warehouse with this code already exists')
    }
    
    return actionError('Failed to create warehouse')
  }
}

// Update a warehouse
export async function updateWarehouse(input: UpdateWarehouseInput): Promise<ActionResponse<unknown>> {
  try {
    const validatedInput = updateWarehouseSchema.parse(input)
    const { id, name, code, description, type, address, contactName, contactEmail, contactPhone, isActive } = validatedInput

    // Check if warehouse exists
    const existingWarehouse = await neonClient.warehouse.findUnique({
      where: { id }
    })

    if (!existingWarehouse) {
      return actionError('Warehouse not found')
    }

    // Check if code change conflicts with existing warehouse
    if (code && code !== existingWarehouse.code) {
      const conflictingWarehouse = await neonClient.warehouse.findFirst({
        where: { 
          code,
          id: { not: id }
        }
      })

      if (conflictingWarehouse) {
        return actionError('Warehouse with this code already exists')
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (code !== undefined) updateData.code = code
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (address !== undefined) updateData.address = address
    if (contactName !== undefined) updateData.managerName = contactName
    if (contactEmail !== undefined) updateData.managerEmail = contactEmail
    if (contactPhone !== undefined) updateData.managerPhone = contactPhone
    if (isActive !== undefined) updateData.isActive = isActive
    updateData.updatedAt = new Date()

    const warehouse = await neonClient.warehouse.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            inventoryItems: true,
          }
        }
      }
    })

    return actionSuccess(warehouse, 'Warehouse updated successfully')
  } catch (error) {
    console.error('Error updating warehouse:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return actionError('Warehouse with this code already exists')
    }
    
    return actionError('Failed to update warehouse')
  }
}

// Delete a warehouse
export async function deleteWarehouse(id: string): Promise<ActionResponse<unknown>> {
  try {
    // Check if warehouse exists
    const existingWarehouse = await neonClient.warehouse.findUnique({
      where: { id },
      include: {
        inventoryItems: true,
      }
    })

    if (!existingWarehouse) {
      return actionError('Warehouse not found')
    }

    // Check if warehouse has inventory items
    if (existingWarehouse.inventoryItems.length > 0) {
      return actionError('Cannot delete warehouse with inventory items')
    }

    await neonClient.warehouse.delete({
      where: { id }
    })

    return actionSuccess(undefined, 'Warehouse deleted successfully')
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return actionError('Warehouse cannot be deleted due to existing references')
    }
    
    return actionError('Failed to delete warehouse')
  }
}
