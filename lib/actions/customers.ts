import { neonClient } from '@/lib/db';

export interface CustomerFilters {
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

// Get all customers with filters
export async function getCustomers(filters: CustomerFilters = {}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters.searchTerm) {
      where.OR = [
        { firstName: { contains: filters.searchTerm, mode: 'insensitive' } },
        { lastName: { contains: filters.searchTerm, mode: 'insensitive' } },
        { companyName: { contains: filters.searchTerm, mode: 'insensitive' } },
        { email: { contains: filters.searchTerm, mode: 'insensitive' } },
      ];
    }

    const customers = await neonClient.customer.findMany({
      where,
      orderBy: [
        { companyName: 'asc' },
        { firstName: 'asc' },
        { lastName: 'asc' }
      ],
      take: filters.limit,
      skip: filters.offset,
    });

    return { success: true, data: customers };
  } catch (error) {
    // Error handled silently in production
    return { success: false, error: 'Failed to fetch customers' };
  }
}

// Get customer by ID
export async function getCustomerById(customerId: string) {
  try {
    const customer = await neonClient.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    return { success: true, data: customer };
  } catch (error) {
    // Error handled silently in production
    return { success: false, error: 'Failed to fetch customer' };
  }
}
