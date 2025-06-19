import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id
    const body = await request.json()
    const { plannedDate, supervisedBy, notes, status } = body

    // Validate audit exists
    const existingAudit = await neonClient.inventoryAudit.findUnique({
      where: { id: auditId }
    })

    if (!existingAudit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      )
    }

    // Validate status transitions
    if (status && status !== existingAudit.status) {
      const validTransitions: Record<string, string[]> = {
        'PLANNED': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
        'COMPLETED': [], // Completed audits cannot be changed
        'CANCELLED': ['PLANNED'] // Can reactivate cancelled audits
      }

      if (!validTransitions[existingAudit.status]?.includes(status)) {
        return NextResponse.json(
          { error: `Cannot change status from ${existingAudit.status} to ${status}` },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: any = {}
    if (plannedDate) updateData.plannedDate = new Date(plannedDate)
    if (supervisedBy !== undefined) updateData.supervisedBy = supervisedBy
    if (notes !== undefined) updateData.notes = notes
    
    // Handle status changes
    if (status && status !== existingAudit.status) {
      updateData.status = status
      
      if (status === 'IN_PROGRESS' && !existingAudit.startedDate) {
        updateData.startedDate = new Date()
      }
      
      if (status === 'COMPLETED') {
        updateData.completedDate = new Date()
        // Calculate final statistics
        const auditItems = await neonClient.inventoryAuditItem.findMany({
          where: { auditId }
        })
        
        const itemsCounted = auditItems.filter(item => item.countedQty !== null).length
        const discrepancies = auditItems.filter(item => 
          item.adjustmentQty !== null && item.adjustmentQty !== 0
        ).length
        
        updateData.itemsCounted = itemsCounted
        updateData.discrepancies = discrepancies
      }
    }

    const updatedAudit = await neonClient.inventoryAudit.update({
      where: { id: auditId },
      data: updateData
    })

    return NextResponse.json({
      audit: updatedAudit
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id

    // Check if audit can be deleted (not in progress)
    const audit = await neonClient.inventoryAudit.findUnique({
      where: { id: auditId }
    })

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      )
    }

    if (audit.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Cannot delete audit in progress' },
        { status: 400 }
      )
    }

    // Delete audit items first (due to foreign key constraints)
    await neonClient.inventoryAuditItem.deleteMany({
      where: { auditId }
    })

    // Delete the audit
    await neonClient.inventoryAudit.delete({
      where: { id: auditId }
    })

    return NextResponse.json({
      message: 'Audit deleted successfully'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
