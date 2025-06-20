/**
 * API Route: Stock Alerts Management
 * 
 * Handles stock alert generation including low stock, out of stock,
 * overstock, and expiry alerts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'
import { authenticate } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
    try {
        // Authenticate the request
        const authResult = await authenticate(request)
        if (!authResult.success) {
            return errorResponse('Unauthorized', 401)
        }

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') // 'LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'EXPIRING'
        const warehouseId = searchParams.get('warehouseId')
        const severity = searchParams.get('severity') // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

        // Get all stock items with product information
        const stockItems = await neonClient.inventoryItem.findMany({
            where: {
                ...(warehouseId && { warehouseId })
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        minStockLevel: true,
                        reorderPoint: true,
                        maxStockLevel: true
                    }
                },
                variant: {
                    select: {
                        id: true,
                        name: true,
                        sku: true
                    }
                },
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        })

        const alerts: any[] = []
        const now = new Date()

        for (const item of stockItems) {
            const { product, quantity, reservedQuantity, expiryDate } = item
            const availableQuantity = quantity - reservedQuantity

            // Low Stock Alert
            if (product.minStockLevel && availableQuantity <= product.minStockLevel) {
                const severity = availableQuantity === 0 ? 'CRITICAL' :
                    availableQuantity <= product.minStockLevel * 0.5 ? 'HIGH' : 'MEDIUM'

                alerts.push({
                    id: `low-stock-${item.id}`,
                    type: availableQuantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
                    severity,
                    productId: product.id,
                    productName: product.name,
                    productSku: product.sku,
                    variantId: item.variant?.id,
                    variantName: item.variant?.name,
                    warehouseId: item.warehouseId,
                    warehouseName: item.warehouse.name,
                    currentQuantity: availableQuantity,
                    minimumLevel: product.minStockLevel,
                    reorderPoint: product.reorderPoint,
                    message: availableQuantity === 0
                        ? `${product.name} is out of stock in ${item.warehouse.name}`
                        : `${product.name} is running low in ${item.warehouse.name} (${availableQuantity} remaining)`,
                    createdAt: now.toISOString(),
                    requiresAction: true
                })
            }

            // Overstock Alert
            if (product.maxStockLevel && quantity > product.maxStockLevel) {
                alerts.push({
                    id: `overstock-${item.id}`,
                    type: 'OVERSTOCK',
                    severity: 'MEDIUM',
                    productId: product.id,
                    productName: product.name,
                    productSku: product.sku,
                    variantId: item.variant?.id,
                    variantName: item.variant?.name,
                    warehouseId: item.warehouseId,
                    warehouseName: item.warehouse.name,
                    currentQuantity: quantity,
                    maximumLevel: product.maxStockLevel,
                    message: `${product.name} is overstocked in ${item.warehouse.name} (${quantity} vs max ${product.maxStockLevel})`,
                    createdAt: now.toISOString(),
                    requiresAction: false
                })
            }

            // Expiry Alert (items expiring within 30 days)
            if (expiryDate) {
                const daysToExpiry = Math.ceil((new Date(expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                if (daysToExpiry <= 30 && daysToExpiry >= 0) {
                    const severity = daysToExpiry <= 7 ? 'CRITICAL' :
                        daysToExpiry <= 14 ? 'HIGH' : 'MEDIUM'

                    alerts.push({
                        id: `expiring-${item.id}`,
                        type: 'EXPIRING',
                        severity,
                        productId: product.id,
                        productName: product.name,
                        productSku: product.sku,
                        variantId: item.variant?.id,
                        variantName: item.variant?.name,
                        warehouseId: item.warehouseId,
                        warehouseName: item.warehouse.name,
                        currentQuantity: quantity,
                        expiryDate: expiryDate,
                        daysToExpiry,
                        message: `${product.name} in ${item.warehouse.name} expires in ${daysToExpiry} days`,
                        createdAt: now.toISOString(),
                        requiresAction: daysToExpiry <= 14
                    })
                }
            }
        }

        // Filter alerts based on query parameters
        let filteredAlerts = alerts

        if (type) {
            filteredAlerts = filteredAlerts.filter(alert => alert.type === type)
        }

        if (severity) {
            filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity)
        }

        // Sort by severity and creation date
        const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
        filteredAlerts.sort((a, b) => {
            const severityDiff = (severityOrder[b.severity as keyof typeof severityOrder] || 0) -
                (severityOrder[a.severity as keyof typeof severityOrder] || 0)
            if (severityDiff !== 0) return severityDiff
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })

        return successResponse({
            alerts: filteredAlerts,
            summary: {
                total: filteredAlerts.length,
                critical: filteredAlerts.filter(a => a.severity === 'CRITICAL').length,
                high: filteredAlerts.filter(a => a.severity === 'HIGH').length,
                medium: filteredAlerts.filter(a => a.severity === 'MEDIUM').length,
                low: filteredAlerts.filter(a => a.severity === 'LOW').length,
                byType: {
                    LOW_STOCK: filteredAlerts.filter(a => a.type === 'LOW_STOCK').length,
                    OUT_OF_STOCK: filteredAlerts.filter(a => a.type === 'OUT_OF_STOCK').length,
                    OVERSTOCK: filteredAlerts.filter(a => a.type === 'OVERSTOCK').length,
                    EXPIRING: filteredAlerts.filter(a => a.type === 'EXPIRING').length
                }
            }
        })

    } catch (error) {
        console.error('Stock alerts API error:', error)
        return errorResponse('Internal server error', 500)
    }
}
