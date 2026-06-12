import { useCallback, useState } from 'react'
import { Edit2, Plus, Tag, Trash2 } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExportCsvButton } from '@/components/ui/ExportCsvButton'
import { Input } from '@/components/ui/Input'
import { PageSearchInput } from '@/components/ui/PageSearchInput'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { Select } from '@/components/ui/Select'
import { useAsyncList } from '@/hooks/useAsyncList'
import { useDeepLinkRecord } from '@/hooks/useDeepLinkRecord'
import { usePagination } from '@/hooks/usePagination'
import { useToast } from '@/hooks/useToast'
import { couponService } from '@/services/couponService'
import { exportToCsv } from '@/utils/exportCsv'
import type { Coupon, DiscountType } from '@/types'

const emptyCoupon: Omit<Coupon, 'id' | 'usageCount'> = {
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  startDate: '',
  endDate: '',
  status: 'active',
}

export default function Coupons() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [deleting, setDeleting] = useState<Coupon | null>(null)
  const [form, setForm] = useState<Omit<Coupon, 'id' | 'usageCount'>>(emptyCoupon)
  const [saving, setSaving] = useState(false)

  const { items: coupons, loading, reload: load } = useAsyncList(
    () => couponService.getAll(),
    [],
  )

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))
  const { page, totalPages, paginatedItems, goToPage, total } = usePagination(filtered, 6)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyCoupon)
    setModalOpen(true)
  }

  const openEdit = useCallback((coupon: Coupon) => {
    setEditing(coupon)
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      status: coupon.status,
    })
    setModalOpen(true)
  }, [])

  const { rowHighlightClass } = useDeepLinkRecord({
    items: filtered,
    getId: (c) => c.id,
    onOpen: (coupon) => {
      const idx = filtered.findIndex((c) => c.id === coupon.id)
      if (idx >= 0) goToPage(Math.floor(idx / 6) + 1)
      openEdit(coupon)
    },
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await couponService.update(editing.id, form)
        toast.success('Coupon updated')
      } else {
        await couponService.create(form)
        toast.success('Coupon created')
      }
      setModalOpen(false)
      await load()
    } catch {
      toast.error('Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (coupon: Coupon) => {
    await couponService.toggleStatus(coupon.id)
    toast.info(`Coupon ${coupon.code} ${coupon.status === 'active' ? 'disabled' : 'enabled'}`)
    await load()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      await couponService.delete(deleting.id)
      toast.success('Coupon deleted')
      setDeleteOpen(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSkeleton />

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error('No coupons to export')
      return
    }
    exportToCsv('coupons-export', filtered, [
      { header: 'Code', value: (c) => c.code },
      { header: 'Discount Type', value: (c) => c.discountType },
      { header: 'Discount Value', value: (c) => c.discountValue },
      { header: 'Start Date', value: (c) => c.startDate },
      { header: 'End Date', value: (c) => c.endDate },
      { header: 'Status', value: (c) => c.status },
      { header: 'Usage Count', value: (c) => c.usageCount },
    ])
    toast.success(`Exported ${filtered.length} coupons`)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Coupons' }]} />
      <Card>
        <CardHeader
          title="Coupon Management"
          subtitle={`${filtered.length} coupons`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ExportCsvButton onClick={handleExportCsv} disabled={filtered.length === 0} />
              <Button onClick={openCreate}><Plus size={18} />Create Coupon</Button>
            </div>
          }
        />
        <div className="mb-6">
          <PageSearchInput
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Tag} title="No Coupons Found" description="Create discount coupons to boost sales and reward customers." actionLabel="Create Coupon" onAction={openCreate} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedItems.map((coupon) => (
                <div
                  key={coupon.id}
                  id={`record-${coupon.id}`}
                  className={`p-4 rounded-xl border border-border hover:border-primary/20 transition-all ${rowHighlightClass(coupon.id)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-primary font-mono">{coupon.code}</p>
                      <p className="text-sm text-text-secondary mt-1">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                      </p>
                    </div>
                    <Badge variant={coupon.status === 'active' ? 'success' : 'default'}>{coupon.status}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">{coupon.startDate} → {coupon.endDate}</p>
                  <p className="text-sm text-text mb-4">Used {coupon.usageCount} times</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(coupon)}><Edit2 size={14} />Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(coupon)}>{coupon.status === 'active' ? 'Disable' : 'Enable'}</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setDeleting(coupon); setDeleteOpen(true) }}><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={goToPage} />
          </>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Create Coupon'}>
        <div className="space-y-4">
          <Input label="Coupon Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Discount Type" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })} options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed Amount' }]} />
            <Input label="Discount Value" type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Coupon" message={`Delete coupon ${deleting?.code}?`} isLoading={saving} />
    </div>
  )
}
