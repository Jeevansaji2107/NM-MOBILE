import { useCallback, useEffect, useMemo, useState } from 'react'
import { DollarSign, ShoppingBag, UserCheck, Users } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { ExportCsvButton } from '@/components/ui/ExportCsvButton'
import { PageSearchInput } from '@/components/ui/PageSearchInput'
import { StatCard } from '@/components/ui/StatCard'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { useToast } from '@/hooks/useToast'
import { useDeepLinkRecord } from '@/hooks/useDeepLinkRecord'
import { customerService } from '@/services/customerService'
import { exportToCsv } from '@/utils/exportCsv'
import { formatINR } from '@/utils/format'
import type { Customer, Order } from '@/types'

export default function Customers() {
  const toast = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalRevenue: 0, avgSpent: 0 })
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [purchaseHistory, setPurchaseHistory] = useState<Order[]>([])

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q),
    )
  }, [customers, search])

  useEffect(() => {
    customerService.getAll().then(setCustomers)
    customerService.getStatistics().then(setStats)
  }, [])

  const handleSelectCustomer = useCallback(async (customer: Customer) => {
    setSelectedCustomer(customer)
    const history = await customerService.getPurchaseHistory(customer.id)
    setPurchaseHistory(history)
  }, [])

  const { rowHighlightClass } = useDeepLinkRecord({
    items: filteredCustomers,
    getId: (c) => c.id,
    onOpen: (customer) => {
      handleSelectCustomer(customer)
    },
  })

  const handleExportCsv = () => {
    if (customers.length === 0) {
      toast.error('No customers to export')
      return
    }
    exportToCsv('customers-export', customers, [
      { header: 'Name', value: (c) => c.name },
      { header: 'Email', value: (c) => c.email },
      { header: 'Phone', value: (c) => c.phone },
      { header: 'City', value: (c) => c.city },
      { header: 'State', value: (c) => c.state },
      { header: 'Total Orders', value: (c) => c.totalOrders },
      { header: 'Lifetime Spend (INR)', value: (c) => c.totalSpent },
      { header: 'Status', value: (c) => c.status },
      { header: 'Joined', value: (c) => c.joinedAt },
      { header: 'Last Order', value: (c) => c.lastOrderDate },
    ])
    toast.success(`Exported ${customers.length} customers`)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Customers' }]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={stats.total} icon={Users} />
        <StatCard title="Active Customers" value={stats.active} icon={UserCheck} />
        <StatCard title="Total Revenue" value={formatINR(stats.totalRevenue)} icon={DollarSign} />
        <StatCard title="Avg. Spent" value={formatINR(Math.round(stats.avgSpent))} icon={ShoppingBag} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Customer List"
            subtitle={`${filteredCustomers.length} customers`}
            action={<ExportCsvButton onClick={handleExportCsv} disabled={customers.length === 0} />}
          />
          <div className="mb-6">
            <PageSearchInput
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Orders</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Total Spent</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-text-secondary">
                      No customers match your search
                    </td>
                  </tr>
                ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    id={`record-${customer.id}`}
                    onClick={() => handleSelectCustomer(customer)}
                    className={`border-b border-border/50 cursor-pointer transition-colors ${
                      selectedCustomer?.id === customer.id
                        ? 'bg-primary/5'
                        : 'hover:bg-white/[0.02]'
                    } ${rowHighlightClass(customer.id)}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{customer.name}</p>
                          <p className="text-xs text-text-secondary">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text">{customer.totalOrders}</td>
                    <td className="py-3 px-4 text-sm text-text">{formatINR(customer.totalSpent)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={customer.status === 'active' ? 'success' : 'default'}>
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Purchase History"
            subtitle={selectedCustomer ? selectedCustomer.name : 'Select a customer'}
          />
          {selectedCustomer ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background border border-border">
                <p className="text-sm text-text-secondary">Total Spent</p>
                <p className="text-2xl font-bold text-primary">
                  {formatINR(selectedCustomer.totalSpent)}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {selectedCustomer.totalOrders} orders · {selectedCustomer.city}, {selectedCustomer.state} · Joined{' '}
                  {new Date(selectedCustomer.joinedAt).toLocaleDateString()}
                </p>
              </div>
              {purchaseHistory.length > 0 ? (
                purchaseHistory.map((order) => (
                  <div key={order.id} className="p-3 rounded-lg border border-border hover:border-primary/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text">{order.orderNumber}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-text-secondary">
                      {formatINR(order.total)} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary text-center py-8">No orders found</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-secondary text-center py-12">
              Click a customer to view their purchase history
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
