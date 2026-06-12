import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RevenueChart } from '@/components/charts/RevenueChart'
import {
  OrderStatusChart,
  FunnelChart,
} from '@/components/charts/AnalyticsCharts'
import { CustomerGrowthChart } from '@/components/charts/CustomerGrowthChart'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderProgress } from '@/components/orders/OrderStatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { DeviceTypeToggle } from '@/components/ui/SegmentedToggle'
import { Select } from '@/components/ui/Select'
import { useDeviceTypeView } from '@/hooks/useDeviceTypeView'
import { useDashboardDateRange } from '@/hooks/useDashboardDateRange'
import { activities, customers } from '@/data/mockData'
import { formatINR } from '@/utils/format'
import { computeDashboardAnalytics } from '@/utils/dashboardAnalytics'
import { DATE_RANGE_OPTIONS } from '@/utils/dateRange'
import {
  countLowStock,
  getLowStockProducts,
  getStockLevel,
} from '@/utils/stockAlerts'
import { countDevicesByType } from '@/utils/deviceTypeView'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'
import { deviceService } from '@/services/deviceService'
import type { Order, Product } from '@/types'

export default function Dashboard() {
  const { dateRange, setDateRange, dateRangeLabel } = useDashboardDateRange()
  const { deviceType, setDeviceType } = useDeviceTypeView()
  const [orders, setOrders] = useState<Order[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [allDevices, setAllDevices] = useState(deviceService.getAllSync())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      orderService.getAll(),
      productService.getAll(),
      deviceService.getAll(),
    ]).then(([orderData, products, devices]) => {
      setOrders(orderData)
      setAllProducts(products)
      setAllDevices(devices)
      setLoading(false)
    })
  }, [])

  const analytics = useMemo(
    () =>
      computeDashboardAnalytics({
        orders,
        customers,
        products: allProducts,
        devices: allDevices,
        dateRange,
        deviceType,
      }),
    [orders, allProducts, allDevices, dateRange, deviceType],
  )

  const deviceCounts = useMemo(
    () => countDevicesByType(allDevices),
    [allDevices],
  )

  if (loading) return <DashboardSkeleton />

  const lowStockProducts = getLowStockProducts(allProducts).slice(0, 6)
  const stockCounts = countLowStock(allProducts)

  const recentCustomers = [...customers]

    .sort(
      (a, b) =>
        new Date(b.lastOrderDate).getTime() -
        new Date(a.lastOrderDate).getTime(),
    )
    .slice(0, 5)

  return (
    <div className='space-y-6'>
      <div className='w-full flex'>
        <div className='w-full flex'>
          <div>
            <h2 className='text-2xl font-bold text-text'>
              Dashboard Analytics
            </h2>
            <p className='text-sm text-text-secondary mt-1'>
              Track revenue, orders, products and customer activity
            </p>
          </div>

          <div className='ml-auto w-40'>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              options={DATE_RANGE_OPTIONS}
              className='w-36'
            />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
        <StatCard
          title='Total Revenue'
          value={formatINR(analytics.stats.revenue)}
          change={analytics.stats.revenueChange}
          icon={DollarSign}
        />
        <StatCard
          title='Total Orders'
          value={analytics.stats.orders}
          change={analytics.stats.ordersChange}
          icon={ShoppingCart}
        />
        <StatCard
          title='Products'
          value={analytics.stats.products}
          change={analytics.stats.productsChange}
          icon={Package}
        />
        <StatCard
          title='Customers'
          value={analytics.stats.customers}
          change={analytics.stats.customersChange}
          icon={Users}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <QuickActions />

        <Card className='lg:col-span-2'>
          <CardHeader
            title='Order Status Distribution'
            subtitle='Pipeline for selected period'
          />
          <OrderStatusChart data={analytics.orderStatusDistribution} />
        </Card>
      </div>

      <div className='grid grid-cols-1'>
        <Card className='xl:col-span-2'>
          <CardHeader
            title='Revenue'
            subtitle={`Trend for ${dateRangeLabel.toLowerCase()}`}
          />
          <RevenueChart data={analytics.revenueData} />
        </Card>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <Card>
          <CardHeader
            title='Customer Growth'
            subtitle={`New customers · ${dateRangeLabel}`}
          />
          <CustomerGrowthChart data={analytics.customerGrowthData} />
        </Card>
        <Card>
          <CardHeader
            title='Order Funnel'
            subtitle='Conversion through workflow'
          />
          <FunnelChart data={analytics.orderFunnel} />
        </Card>
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <p className='text-sm text-text-secondary'>Top device models by type</p>
        <DeviceTypeToggle
          value={deviceType}
          onChange={setDeviceType}
          mobileCount={deviceCounts.mobile}
          laptopCount={deviceCounts.laptop}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader
            title='Top Selling Products'
            subtitle='By revenue in period'
          />
          <div className='space-y-3'>
            {analytics.topProducts.length === 0 ? (
              <p className='text-sm text-text-secondary py-2'>
                No product sales in this period
              </p>
            ) : (
              analytics.topProducts.slice(0, 5).map((p, i) => (
                <div key={p.name} className='flex items-center gap-3'>
                  <span className='w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center'>
                    {i + 1}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-text truncate'>{p.name}</p>
                    <p className='text-xs text-text-secondary'>
                      {p.sales} sales
                    </p>
                  </div>
                  <p className='text-sm font-medium text-primary shrink-0'>
                    {formatINR(p.revenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title='Top Categories' subtitle='By revenue in period' />
          <div className='space-y-3'>
            {analytics.topCategories.length === 0 ? (
              <p className='text-sm text-text-secondary py-2'>
                No category sales in this period
              </p>
            ) : (
              analytics.topCategories.slice(0, 5).map((c) => (
                <div
                  key={c.name}
                  className='flex items-center justify-between gap-2'
                >
                  <span className='text-sm text-text truncate'>{c.name}</span>
                  <span className='text-sm font-medium text-primary shrink-0'>
                    {formatINR(c.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <CardHeader
            title='Top Device Models'
            subtitle={`${deviceType === 'mobile' ? 'Mobile' : 'Laptop'} · ${dateRangeLabel}`}
          />
          <div className='space-y-3'>
            {analytics.topDeviceModels.length === 0 ? (
              <p className='text-sm text-text-secondary py-2'>
                No device-linked sales in this period
              </p>
            ) : (
              analytics.topDeviceModels.slice(0, 5).map((d) => (
                <div
                  key={d.model}
                  className='flex items-center justify-between gap-2'
                >
                  <div className='min-w-0'>
                    <p className='text-sm text-text truncate'>{d.model}</p>
                    <p className='text-xs text-text-secondary'>{d.brand}</p>
                  </div>
                  <span className='text-sm font-medium text-primary shrink-0'>
                    {d.sales}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title='Top Cities'
          subtitle='Customer revenue by city in period'
        />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
          {analytics.topCities.length === 0 ? (
            <p className='text-sm text-text-secondary col-span-full py-2'>
              No city data for this period
            </p>
          ) : (
            analytics.topCities.slice(0, 6).map((c) => (
              <div
                key={c.city}
                className='flex items-center justify-between p-3 rounded-lg border border-border gap-2'
              >
                <div className='min-w-0'>
                  <p className='text-sm text-text truncate'>{c.city}</p>
                  <p className='text-xs text-text-secondary'>
                    {c.state} · {c.customers} customers
                  </p>
                </div>
                <span className='text-sm font-medium text-primary shrink-0'>
                  {formatINR(c.revenue)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader
            title='Low Stock Alerts'
            subtitle={`${stockCounts.total} items need attention`}
            action={
              <div className='flex items-center gap-2 shrink-0'>
                {stockCounts.critical > 0 && (
                  <Badge variant='danger'>
                    {stockCounts.critical} critical
                  </Badge>
                )}
                {stockCounts.warning > 0 && (
                  <Badge variant='warning'>{stockCounts.warning} low</Badge>
                )}
                <Link
                  to='/products'
                  className='text-xs text-primary hover:underline whitespace-nowrap'
                >
                  View all
                </Link>
              </div>
            }
          />
          {lowStockProducts.length === 0 ? (
            <p className='text-sm text-text-secondary py-4'>
              All products are well stocked
            </p>
          ) : (
            <div className='space-y-3'>
              {lowStockProducts.map((p) => {
                const level = getStockLevel(p.stock)
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      level === 'critical'
                        ? 'border-red-500/30 hover:border-red-500/50'
                        : 'border-amber-500/30 hover:border-amber-500/50'
                    }`}
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <AlertTriangle
                        size={16}
                        className={
                          level === 'critical'
                            ? 'text-red-400 shrink-0'
                            : 'text-amber-400 shrink-0'
                        }
                      />
                      <div className='min-w-0'>
                        <p className='text-sm text-text truncate'>{p.name}</p>
                        <p className='text-xs text-text-secondary'>{p.sku}</p>
                      </div>
                    </div>
                    <Badge
                      variant={level === 'critical' ? 'danger' : 'warning'}
                    >
                      {p.stock} left
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
        <Card>
          <CardHeader
            title='Recent Orders'
            subtitle={`Latest in ${dateRangeLabel.toLowerCase()}`}
            action={
              <Link
                to='/orders'
                className='text-xs text-primary hover:underline'
              >
                View all
              </Link>
            }
          />
          <div className='space-y-4'>
            {analytics.recentOrders.length === 0 ? (
              <p className='text-sm text-text-secondary py-4'>
                No orders in this period
              </p>
            ) : (
              analytics.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className='p-3 rounded-lg border border-border'
                >
                  <div className='flex items-center justify-between mb-2 gap-2'>
                    <span className='text-sm font-medium text-text truncate'>
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className='text-xs text-text-secondary mb-2 truncate'>
                    {order.customerName} · {formatINR(order.total)}
                  </p>
                  <OrderProgress status={order.status} />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader title='Recent Activity' subtitle='Latest updates' />
          <div className='space-y-3 max-h-64 overflow-y-auto'>
            {activities.slice(0, 6).map((a) => (
              <div key={a.id} className='flex gap-3'>
                <div className='w-2 h-2 rounded-full bg-primary mt-2 shrink-0' />
                <div className='min-w-0'>
                  <p className='text-sm text-text'>{a.message}</p>
                  <p className='text-xs text-text-secondary'>
                    {new Date(a.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader
            title='Recent Customers'
            subtitle='Latest registered customers'
            action={
              <Link
                to='/customers'
                className='text-xs text-primary hover:underline'
              >
                View all
              </Link>
            }
          />
          <div className='space-y-3'>
            {recentCustomers.map((c) => (
              <Link
                key={c.id}
                to={`/customers?id=${c.id}`}
                className='flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/20 transition-colors gap-3'
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0'>
                    {c.name.charAt(0)}
                  </div>
                  <div className='min-w-0'>
                    <p className='text-sm text-text truncate'>{c.name}</p>
                    <p className='text-xs text-text-secondary'>
                      {c.totalOrders} orders
                    </p>
                  </div>
                </div>
                <p className='text-sm text-primary shrink-0'>
                  {formatINR(c.totalSpent)}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
