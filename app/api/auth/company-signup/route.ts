import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/prisma/generated/supabase'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      // User data
      userId,
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      timezone,
      language,
      
      // Company data
      companyName,
      companyDisplayName,
      companyDescription,
      companyWebsite,
      industry,
      companySize,
      businessType,
      companyEmail,
      companyPhone,
      address,
      registrationNumber,
      taxId,
      vatNumber,
    } = body

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or update user record
      const user = await tx.user.upsert({
        where: { id: userId },
        update: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          displayName: `${firstName.trim()} ${lastName.trim()}`,
          phone: phone?.trim() || null,
          timezone: timezone || 'UTC',
          language: language || 'en',
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          id: userId,
          email: email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          displayName: `${firstName.trim()} ${lastName.trim()}`,
          phone: phone?.trim() || null,
          timezone: timezone || 'UTC',
          language: language || 'en',
          theme: 'system',
          isActive: true,
          isVerified: false,
          emailVerified: false,
        },
      })

      // 2. Create company record
      const company = await tx.company.create({
        data: {
          name: companyName.trim(),
          displayName: companyDisplayName?.trim() || companyName.trim(),
          description: companyDescription?.trim() || null,
          website: companyWebsite?.trim() || null,
          industry: industry,
          size: companySize,
          email: companyEmail.trim(),
          phone: companyPhone?.trim() || null,
          address: address,
          registrationNumber: registrationNumber?.trim() || null,
          taxId: taxId?.trim() || null,
          vatNumber: vatNumber?.trim() || null,
          businessType: businessType,          subscriptionPlan: 'FREE',
          subscriptionStatus: 'ACTIVE',
          isActive: true,
          setupComplete: true,
          onboardingStep: 'completed',
          createdBy: userId,
        },
      })

      // 3. Create company-user relationship (admin role)
      const companyUser = await tx.companyUser.create({
        data: {
          companyId: company.id,
          userId: userId,
          role: 'ADMIN',
          title: jobTitle?.trim() || null,
          isActive: true,
          isOwner: true,
          canInvite: true,
          canManageBilling: true,
          status: 'ACTIVE',
        },
      })

      return { user, company, companyUser }
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Company registration successful!'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create company'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
