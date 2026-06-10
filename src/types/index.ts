export type OrderStatus =
  | 'pending'
  | 'design_ready'
  | 'printing'
  | 'quality_check'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type StaffRole = 'super_admin' | 'admin' | 'manager' | 'staff'

export type DiscountType = 'percentage' | 'fixed'

export interface User {
  id: string
  email: string
  name: string
  role: StaffRole
  avatar?: string
}

export type DeviceType = 'mobile' | 'laptop'

export interface DeviceBrand {
  id: string
  name: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Device {
  id: string
  brandId: string
  brandName: string
  model: string
  deviceType: DeviceType
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Product {
  id: string
  name: string
  sku: string
  description: string
  price: number
  categoryId: string
  categoryName: string
  subcategoryId?: string
  variant?: string
  stock: number
  status: 'active' | 'inactive'
  image: string
  tags: string[]
  compatibleDeviceIds: string[]
  createdAt: string
}

export interface Subcategory {
  id: string
  name: string
  description?: string
  variants?: Variant[]
  productCount?: number
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  image: string
  productCount?: number
  subcategories: Subcategory[]
  status: 'active' | 'inactive'
  createdAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface OrderTimelineEvent {
  status: OrderStatus
  label: string
  timestamp: string
  note?: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  timeline: OrderTimelineEvent[]
  createdAt: string
  updatedAt: string
}

export interface Coupon {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  startDate: string
  endDate: string
  status: 'active' | 'disabled'
  usageCount: number
  maxUsage?: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  status: 'active' | 'inactive'
  joinedAt: string
}

export interface StaffMember {
  id: string
  name: string
  email: string
  role: StaffRole
  department: string
  status: 'active' | 'inactive'
  permissions: string[]
  joinedAt: string
}

export interface Activity {
  id: string
  type: 'order' | 'product' | 'customer' | 'staff'
  message: string
  timestamp: string
}

export interface RevenueData {
  month: string
  revenue: number
  orders: number
}

export interface CustomerGrowthData {
  month: string
  customers: number
  newCustomers: number
}

export interface TopProduct {
  name: string
  sales: number
  revenue: number
}

export interface TopCategory {
  name: string
  sales: number
  revenue: number
}

export interface TopDeviceModel {
  model: string
  brand: string
  sales: number
  revenue: number
}

export interface CategoryRevenue {
  category: string
  revenue: number
}

export interface BrandRevenue {
  brand: string
  revenue: number
}

export interface OrderStatusCount {
  status: string
  count: number
  label: string
}

export interface OrderFunnelStep {
  step: string
  count: number
  percentage: number
}

export interface CouponPerformance {
  code: string
  usageCount: number
  revenue: number
}

export interface TopCity {
  city: string
  state: string
  customers: number
  revenue: number
  orders: number
}

export interface CityCustomerCount {
  city: string
  state: string
  customers: number
}

export interface Notification {
  id: string
  type: 'order' | 'stock' | 'coupon' | 'customer' | 'staff' | 'delivery'
  title: string
  message: string
  timestamp: string
  read: boolean
  link?: string
}

export interface SearchResult {
  id: string
  type: 'product' | 'customer' | 'order' | 'device' | 'coupon'
  title: string
  subtitle: string
  path: string
}

export interface DashboardStats {
  revenue: number
  revenueChange: number
  orders: number
  ordersChange: number
  products: number
  productsChange: number
  customers: number
  customersChange: number
}

export interface StoreSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
  timezone: string
}

export interface BrandSettings {
  companyName: string
  primaryColor: string
  logoUrl: string
  tagline: string
}

export interface AccountSettings {
  name: string
  email: string
  phone: string
  notifications: boolean
  twoFactor: boolean
}

export interface AppSettings {
  store: StoreSettings
  brand: BrandSettings
  account: AccountSettings
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export type SortDirection = 'asc' | 'desc'

export type Variant = string // simple variant name

export interface DeviceModel {
  id: string
  brand: string
  model: string
  deviceType: DeviceType
  status: 'active' | 'inactive'
  createdAt: string
}
