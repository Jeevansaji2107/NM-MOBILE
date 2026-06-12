import type { StaffMember, User } from '@/types'
import { categories, products } from './generators/generateProducts'
import { customers } from './generators/generateCustomers'
import { orders } from './generators/generateOrders'
import {
  activities,
  customerGrowthData,
  dashboardStats,
  revenueData,
  topProducts,
} from './generators/computeAnalytics'

export { categories, products, customers, orders }
export { activities, customerGrowthData, dashboardStats, revenueData, topProducts }

export const mockUser: User = {
  id: '1',
  email: 'admin@nmskins.com',
  name: 'Admin User',
  role: 'super_admin',
}

export const staffMembers: StaffMember[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@nmskins.com',
    role: 'super_admin',
    department: 'Management',
    status: 'active',
    permissions: ['all'],
    joinedAt: '2023-01-01',
  },
  {
    id: '2',
    name: 'John Manager',
    email: 'john@nmskins.com',
    role: 'manager',
    department: 'Operations',
    status: 'active',
    permissions: ['products', 'orders', 'customers'],
    joinedAt: '2023-03-15',
  },
  {
    id: '3',
    name: 'Jane Admin',
    email: 'jane@nmskins.com',
    role: 'admin',
    department: 'Sales',
    status: 'active',
    permissions: ['products', 'orders', 'analytics'],
    joinedAt: '2023-06-01',
  },
  {
    id: '4',
    name: 'Bob Staff',
    email: 'bob@nmskins.com',
    role: 'staff',
    department: 'Support',
    status: 'active',
    permissions: ['orders', 'customers'],
    joinedAt: '2024-01-10',
  },
  {
    id: '5',
    name: 'Alice Support',
    email: 'alice@nmskins.com',
    role: 'staff',
    department: 'Support',
    status: 'inactive',
    permissions: ['orders'],
    joinedAt: '2024-03-20',
  },
]

export const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
}

export const allPermissions = [
  'products',
  'orders',
  'customers',
  'analytics',
  'staff',
  'settings',
  'devices',
  'coupons',
]