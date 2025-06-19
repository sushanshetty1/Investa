import { neonClient } from '../lib/db';

const sampleCustomers = [
  // Individual Customers
  {
    customerNumber: 'CUST-001',
    type: 'INDIVIDUAL' as const,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    mobile: '+1-555-0102',
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    creditLimit: 5000.00,
    paymentTerms: 'Net 30',
    status: 'ACTIVE' as const,
    notes: 'Loyal customer since 2020',
    createdBy: 'system'
  },
  {
    customerNumber: 'CUST-002',
    type: 'INDIVIDUAL' as const,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0201',
    mobile: '+1-555-0202',
    billingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    creditLimit: 3000.00,
    paymentTerms: 'Net 15',
    status: 'ACTIVE' as const,
    allowMarketing: true,
    source: 'Website',
    createdBy: 'system'
  },
  {
    customerNumber: 'CUST-003',
    type: 'INDIVIDUAL' as const,
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@email.com',
    phone: '+1-555-0301',
    billingAddress: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    creditLimit: 2500.00,
    paymentTerms: 'Net 30',
    status: 'ACTIVE' as const,
    preferredLanguage: 'en',
    timezone: 'America/Chicago',
    createdBy: 'system'
  },

  // Business Customers
  {
    customerNumber: 'CUST-004',
    type: 'BUSINESS' as const,
    companyName: 'TechCorp Solutions',
    taxId: '12-3456789',
    email: 'orders@techcorp.com',
    phone: '+1-555-0401',
    billingAddress: {
      street: '100 Business Park Dr',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    },
    shippingAddress: {
      street: '200 Warehouse Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '73302',
      country: 'USA'
    },
    creditLimit: 50000.00,
    paymentTerms: 'Net 45',
    status: 'ACTIVE' as const,
    notes: 'Large enterprise client with bulk orders',
    source: 'Sales Team',
    createdBy: 'system'
  },
  {
    customerNumber: 'CUST-005',
    type: 'BUSINESS' as const,
    companyName: 'Green Earth Retail',
    taxId: '98-7654321',
    email: 'purchasing@greenearth.com',
    phone: '+1-555-0501',
    mobile: '+1-555-0502',
    billingAddress: {
      street: '555 Eco Way',
      city: 'Portland',
      state: 'OR',
      zipCode: '97205',
      country: 'USA'
    },
    creditLimit: 25000.00,
    paymentTerms: 'Net 30',
    status: 'ACTIVE' as const,
    allowMarketing: true,
    source: 'Trade Show',
    notes: 'Focuses on eco-friendly products',
    createdBy: 'system'
  },
  {
    customerNumber: 'CUST-006',
    type: 'BUSINESS' as const,
    companyName: 'FastTrack Logistics',
    taxId: '56-7890123',
    email: 'procurement@fasttrack.com',
    phone: '+1-555-0601',
    billingAddress: {
      street: '300 Distribution Center',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      country: 'USA'
    },
    creditLimit: 75000.00,
    paymentTerms: 'Net 60',
    status: 'ACTIVE' as const,
    notes: 'Major distribution partner',
    source: 'Partnership',
    createdBy: 'system'
  },

  // Reseller Customers
  {
    customerNumber: 'CUST-007',
    type: 'RESELLER' as const,
    companyName: 'Elite Resellers Inc',
    taxId: '34-5678901',
    email: 'sales@eliteresellers.com',
    phone: '+1-555-0701',
    billingAddress: {
      street: '888 Commerce St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    creditLimit: 100000.00,
    paymentTerms: 'Net 30',
    status: 'ACTIVE' as const,
    notes: 'Authorized reseller with volume discounts',
    source: 'Partner Program',
    createdBy: 'system'
  },

  // Distributor
  {
    customerNumber: 'CUST-008',
    type: 'DISTRIBUTOR' as const,
    companyName: 'MegaDistribution Network',
    taxId: '78-9012345',
    email: 'orders@megadist.com',
    phone: '+1-555-0801',
    billingAddress: {
      street: '1000 Industrial Pkwy',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    },
    creditLimit: 250000.00,
    paymentTerms: 'Net 45',
    status: 'ACTIVE' as const,
    notes: 'Primary distributor for Southwest region',
    source: 'Partnership',
    allowMarketing: false,
    createdBy: 'system'
  },

  // Prospect Customer
  {
    customerNumber: 'CUST-009',
    type: 'BUSINESS' as const,
    companyName: 'Future Tech Innovations',
    email: 'contact@futuretech.com',
    phone: '+1-555-0901',
    billingAddress: {
      street: '2000 Innovation Dr',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    creditLimit: 10000.00,
    paymentTerms: 'Net 15',
    status: 'PROSPECT' as const,
    notes: 'Potential new customer - following up on quote',
    source: 'Cold Outreach',
    createdBy: 'system'
  },

  // International Customer
  {
    customerNumber: 'CUST-010',
    type: 'BUSINESS' as const,
    companyName: 'Global Import Export Ltd',
    email: 'orders@globalimport.ca',
    phone: '+1-416-555-1001',
    billingAddress: {
      street: '500 King St W',
      city: 'Toronto',
      state: 'ON',
      zipCode: 'M5V 1L9',
      country: 'Canada'
    },
    creditLimit: 35000.00,
    paymentTerms: 'Net 30',
    currency: 'CAD',
    status: 'ACTIVE' as const,
    notes: 'International customer - handles customs paperwork',
    source: 'Referral',
    createdBy: 'system'
  }
];

async function seedCustomers() {
  try {
    console.log('🌱 Starting customer seeding...');

    // Check if customers already exist
    const existingCustomers = await neonClient.customer.count();
    if (existingCustomers > 0) {
      console.log(`⚠️  Found ${existingCustomers} existing customers. Skipping seed to avoid duplicates.`);
      console.log('💡 To re-seed, please truncate the customers table first.');
      return;
    }

    // Create customers
    console.log(`📝 Creating ${sampleCustomers.length} sample customers...`);
    
    for (const customerData of sampleCustomers) {
      try {
        const customer = await neonClient.customer.create({
          data: customerData
        });
        console.log(`✅ Created customer: ${customer.customerNumber} - ${customer.companyName || `${customer.firstName} ${customer.lastName}`}`);
      } catch (error) {
        console.error(`❌ Failed to create customer ${customerData.customerNumber}:`, error);
      }
    }

    // Summary
    const totalCustomers = await neonClient.customer.count();
    console.log(`\n🎉 Customer seeding completed!`);
    console.log(`📊 Total customers in database: ${totalCustomers}`);
    
    // Show breakdown by type
    const customersByType = await neonClient.customer.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    console.log('\n📈 Customer breakdown by type:');
    customersByType.forEach(group => {
      console.log(`   ${group.type}: ${group._count.type}`);
    });

  } catch (error) {
    console.error('💥 Error seeding customers:', error);
    throw error;
  } finally {
    await neonClient.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedCustomers()
    .then(() => {
      console.log('✨ Customer seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Customer seeding script failed:', error);
      process.exit(1);
    });
}

export { seedCustomers };
