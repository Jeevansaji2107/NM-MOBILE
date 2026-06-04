import { useEffect, useMemo, useState } from 'react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { DeviceTypeToggle } from '@/components/ui/SegmentedToggle'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { CustomerGrowthChart } from '@/components/charts/CustomerGrowthChart'
import { TopProductsChart } from '@/components/charts/TopProductsChart'
import {
  CategoryRevenueChart,
  CityBarChart,
  CityCustomerChart,
  CouponChart,
  FunnelChart,
} from '@/components/charts/AnalyticsCharts'
import { couponPerformance } from '@/data/analyticsData'
import { customers } from '@/data/mockData'
import { useDeviceTypeView } from '@/hooks/useDeviceTypeView'
import { useDashboardDateRange } from '@/hooks/useDashboardDateRange'
import { computeDashboardAnalytics } from '@/utils/dashboardAnalytics'
import { countDevicesByType } from '@/utils/deviceTypeView'
import { formatINR } from '@/utils/format'
import { getDateRangeLabel } from '@/utils/dateRange'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'
import { deviceService } from '@/services/deviceService'

export default function Analytics() {
  const { dateRange } = useDashboardDateRange()
  const { deviceType, setDeviceType } = useDeviceTypeView()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof orderService.getAll>>>([])
  const [products, setProducts] = useState<Awaited<ReturnType<typeof productService.getAll>>>([])
  const [devices, setDevices] = useState(deviceService.getAllSync())

  useEffect(() => {
    Promise.all([orderService.getAll(), productService.getAll(), deviceService.getAll()]).then(
      ([orderData, productData, deviceData]) => {
        setOrders(orderData)
        setProducts(productData)
        setDevices(deviceData)
        setLoading(false)
      },
    )
  }, [])

  const analytics = useMemo(
    () =>
      computeDashboardAnalytics({
        orders,
        customers,
        products,
        devices,
        dateRange,
        deviceType,
      }),
    [orders, products, devices, dateRange, deviceType],
  )

  const deviceCounts = useMemo(() => countDevicesByType(devices), [devices])

  if (loading) return <PageSkeleton />

  const dateLabel = getDateRangeLabel(dateRange)

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Analytics' }]} />
      <p className="text-sm text-text-secondary">
        Showing: <span className="text-primary font-medium">{dateLabel}</span> (synced with dashboard filter)
      </p>

      <Card>
        <CardHeader title="Revenue By Month" subtitle={`Monthly performance · ${dateLabel}`} />
        <RevenueChart data={analytics.revenueData} />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Revenue By Category" subtitle="Category-wise breakdown" />
          <CategoryRevenueChart data={analytics.topCategories.map((c) => ({ category: c.name, revenue: c.revenue }))} />
        </Card>
        <Card>
          <CardHeader title="Order Funnel" subtitle="Workflow conversion" />
          <FunnelChart data={analytics.orderFunnel} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Customer Growth" subtitle={dateLabel} />
          <CustomerGrowthChart data={analytics.customerGrowthData} />
        </Card>
        <Card>
          <CardHeader title="Top Selling Products" subtitle="By revenue" />
          <TopProductsChart data={analytics.topProducts} />
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-text-secondary">Device analytics by type</p>
        <DeviceTypeToggle
          value={deviceType}
          onChange={setDeviceType}
          mobileCount={deviceCounts.mobile}
          laptopCount={deviceCounts.laptop}
        />
      </div>

      <Card>
        <CardHeader
          title="Top Selling Devices"
          subtitle={`${deviceType === 'mobile' ? 'Mobile' : 'Laptop'} models · ${dateLabel}`}
        />
        <div className="space-y-3">
          {analytics.topDeviceModels.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">No device-linked sales in this period</p>
          ) : (
            analytics.topDeviceModels.map((d, i) => (
              <div key={d.model} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm text-text">{d.model}</p>
                    <p className="text-xs text-text-secondary">{d.brand}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{formatINR(d.revenue)}</p>
                  <p className="text-xs text-text-secondary">{d.sales} sales</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Top Cities by Revenue" subtitle={`Geographic insights · ${dateLabel}`} />
          {analytics.topCities.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">No city revenue data for this period</p>
          ) : (
            <CityBarChart
              data={analytics.topCities.map((c) => ({ city: c.city, value: c.revenue }))}
              valueLabel="Revenue"
              formatValue={(v) => formatINR(v)}
            />
          )}
        </Card>
        <Card>
          <CardHeader title="Top Cities by Orders" subtitle="Most orders by city" />
          {analytics.topCitiesByOrders.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">No city order data for this period</p>
          ) : (
            <CityBarChart
              data={analytics.topCitiesByOrders.map((c) => ({ city: c.city, value: c.orders }))}
              valueLabel="Orders"
            />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Customer Distribution by City" subtitle="All registered customers" />
        {analytics.customerDistributionByCity.length === 0 ? (
          <p className="text-sm text-text-secondary py-4">No customer city data</p>
        ) : (
          <CityCustomerChart
            data={analytics.customerDistributionByCity.map((c) => ({
              city: c.city,
              customers: c.customers,
            }))}
          />
        )}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Top Categories" subtitle="Sales by category" />
          <div className="space-y-3">
            {analytics.topCategories.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-sm text-text">{c.name}</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{formatINR(c.revenue)}</p>
                  <p className="text-xs text-text-secondary">{c.sales} sold</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Coupon Performance" subtitle="Usage by coupon code" />
          <CouponChart data={couponPerformance} />
        </Card>
      </div>
    </div>
  )
}
