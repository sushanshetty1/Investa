#!/usr/bin/env node

/**
 * Simple API Test Script
 * Tests the core API endpoints to verify functionality
 * Run with: node scripts/test-api.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function testEndpoint(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-key', // Replace with real API key
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    console.log(`✓ ${method} ${endpoint}:`, response.status, result.success ? '✅' : '❌');
    return { success: response.ok, status: response.status, data: result };
  } catch (error) {
    console.log(`✗ ${method} ${endpoint}:`, '❌', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing API Endpoints...\n');

  // Test health endpoint
  await testEndpoint('/health');

  // Test documentation endpoint
  await testEndpoint('/docs');

  // Test inventory endpoints
  console.log('\n📦 Testing Inventory Endpoints:');
  await testEndpoint('/inventory/products');
  await testEndpoint('/inventory/categories');
  await testEndpoint('/inventory/brands');
  await testEndpoint('/inventory/suppliers');
  await testEndpoint('/inventory/warehouses');
  await testEndpoint('/inventory/stock');

  // Test creating a category
  console.log('\n📝 Testing Create Operations:');
  const newCategory = {
    name: 'Test Category',
    slug: 'test-category',
    description: 'A test category',
    isActive: true,
  };
  await testEndpoint('/inventory/categories', 'POST', newCategory);

  console.log('\n✅ API Tests Complete');
}

// Only run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
