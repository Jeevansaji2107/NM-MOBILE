import { useCallback, useEffect, useState } from 'react'
import { Eye, ShoppingCart } from 'lucide-react'
import { OrderProgress, OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExportCsvButton } from '@/components/ui/ExportCsvButton'
import { PageSearchInput } from '@/components/ui/PageSearchInput'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { Select } from '@/components/ui/Select'
import { useDeepLinkRecord } from '@/hooks/useDeepLinkRecord'
import { usePagination } from '@/hooks/usePagination'
import { useToast } from '@/hooks/useToast'
import { orderService } from '@/services/orderService'
import { orderStatusOptions, ORDER_STATUS_CONFIG } from '@/utils/orderStatus'
import { exportToCsv } from '@/utils/exportCsv'
import { formatINR } from '@/utils/format'
import type { Order, OrderStatus } from '@/types'

export default function Orders() {
  const toast = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    orderService.getAll().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const { page, totalPages, paginatedItems, goToPage, total, setPage } = usePagination(filtered, 8)

  const openOrder = useCallback((order: Order) => {
    setSelectedOrder(order)
  }, [])

  const { rowHighlightClass } = useDeepLinkRecord({
    items: filtered,
    getId: (o) => o.id,
    onOpen: (order) => {
      openOrder(order)
      const idx = filtered.findIndex((o) => o.id === order.id)
      if (idx >= 0) setPage(Math.floor(idx / 8) + 1)
    },
  })

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId)
    try {
      const updated = await orderService.updateStatus(orderId, status)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
      if (selectedOrder?.id === orderId) setSelectedOrder(updated)
      toast.success(`Order status updated to ${status.replace('_', ' ')}`)
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setUpdating(null)
    }
  }

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error('No orders to export')
      return
    }
    exportToCsv('orders-export', filtered, [
      { header: 'Order Number', value: (o) => o.orderNumber },
      { header: 'Customer', value: (o) => o.customerName },
      { header: 'Email', value: (o) => o.customerEmail },
      { header: 'Total (INR)', value: (o) => o.total },
      { header: 'Status', value: (o) => ORDER_STATUS_CONFIG[o.status].label },
      { header: 'Items', value: (o) => o.items.map((i) => `${i.productName} x${i.quantity}`).join('; ') },
      { header: 'Created', value: (o) => o.createdAt },
      { header: 'Updated', value: (o) => o.updatedAt },
    ])
    toast.success(`Exported ${filtered.length} orders`)
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Orders' }]} />
      <Card>
        <CardHeader
          title="NM Skins Order Workflow"
          subtitle={`${filtered.length} orders`}
          action={<ExportCsvButton onClick={handleExportCsv} disabled={filtered.length === 0} />}
        />
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-6">
          <PageSearchInput
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: 'all', label: 'All Statuses' }, ...orderStatusOptions]}
            className="sm:w-48"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No Orders Found" description="Orders will appear here once customers start purchasing NM Skins products." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Order #</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Total</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Progress</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((order) => (
                    <tr
                      key={order.id}
                      id={`record-${order.id}`}
                      className={`border-b border-border/50 hover:bg-white/[0.02] ${rowHighlightClass(order.id)}`}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-text whitespace-nowrap">{order.orderNumber}</td>
                      <td className="py-3 px-4 min-w-[140px]">
                        <p className="text-sm text-text truncate">{order.customerName}</p>
                        <p className="text-xs text-text-secondary truncate">{order.customerEmail}</p>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-text">{formatINR(order.total)}</td>
                      <td className="py-3 px-4 w-32"><OrderProgress status={order.status} /></td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-2">
                          <OrderStatusBadge status={order.status} />
                          <Select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            options={orderStatusOptions}
                            disabled={updating === order.id}
                            className="w-40 text-xs"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openOrder(order)}
                          className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10"
                          title="View timeline"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={goToPage} />
          </>
        )}
      </Card>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-background border border-border">
              <div>
                <p className="text-xs text-text-secondary">Customer</p>
                <p className="text-sm text-text">{selectedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total</p>
                <p className="text-sm font-medium text-primary">{formatINR(selectedOrder.total)}</p>
              </div>
            </div>
            <OrderProgress status={selectedOrder.status} />
            <div>
              <h4 className="text-sm font-medium text-text mb-2">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                    <div>
                      <p className="text-sm font-medium text-text">{item.productName}</p>
                      <p className="text-xs text-text-secondary">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-primary">{formatINR(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-text mb-4">Order Timeline</h4>
              <OrderTimeline timeline={selectedOrder.timeline} currentStatus={selectedOrder.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
