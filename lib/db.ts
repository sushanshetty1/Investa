// Multi-database Prisma client setup
// This file provides easy access to both Neon and Supabase databases

import { PrismaClient as NeonPrismaClient } from '../prisma/generated/neon'
import { PrismaClient as SupabasePrismaClient } from '../prisma/generated/supabase'

// Neon database client
export const neonClient = new NeonPrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Supabase database client  
export const supabaseClient = new SupabasePrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Helper function to disconnect all clients
export const disconnectAll = async () => {
  await neonClient.$disconnect()
  await supabaseClient.$disconnect()
}

// Example usage in your application:
// 
// import { neonClient, supabaseClient } from '@/lib/db'
// 
// // Use Neon database
// const users = await neonClient.user.findMany()
//
// // Use Supabase database  
// const profiles = await supabaseClient.profile.findMany()
