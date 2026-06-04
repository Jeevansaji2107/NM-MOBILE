import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Edit2, Plus, Smartphone, Trash2 } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
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
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DeviceTypeToggle } from '@/components/ui/SegmentedToggle'
import { useAsyncList } from '@/hooks/useAsyncList'
import { useDeepLinkRecord } from '@/hooks/useDeepLinkRecord'
import { useDeviceTypeView } from '@/hooks/useDeviceTypeView'
import { usePagination } from '@/hooks/usePagination'
import { useToast } from '@/hooks/useToast'
import { deviceService } from '@/services/deviceService'
import { exportToCsv } from '@/utils/exportCsv'
import { countDevicesByType } from '@/utils/deviceTypeView'
import type { Device, DeviceType } from '@/types'

const emptyDevice: Omit<Device, 'id' | 'createdAt' | 'brandName'> & { brandName: string } = {
  brandId: 'b1',
  brandName: 'Apple',
  model: '',
  deviceType: 'mobile',
  status: 'active',
}

export default function Devices() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const { deviceType, setDeviceType } = useDeviceTypeView()
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Device | null>(null)
  const [deleting, setDeleting] = useState<Device | null>(null)
  const [form, setForm] = useState<Omit<Device, 'id' | 'createdAt'>>(emptyDevice)
  const [saving, setSaving] = useState(false)

  const allDevicesSync = deviceService.getAllSync()
  const deviceCounts = useMemo(() => countDevicesByType(allDevicesSync), [allDevicesSync])

  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam === 'mobile' || typeParam === 'laptop') {
      setDeviceType(typeParam)
    }
  }, [searchParams, setDeviceType])

  const brands = deviceService.getBrandsSync()

  const { items: devices, loading, setLoading, reload: load } = useAsyncList(
    () => (search ? deviceService.search(search) : deviceService.getAll()),
    [search],
  )

  const typeFiltered = useMemo(
    () => devices.filter((d) => d.deviceType === deviceType),
    [devices, deviceType],
  )

  const filtered = useMemo(
    () => typeFiltered.filter((d) => brandFilter === 'all' || d.brandId === brandFilter),
    [typeFiltered, brandFilter],
  )

  const { page, totalPages, paginatedItems, goToPage, total } = usePagination(filtered, 8)

  const brandsInView = useMemo(() => {
    const counts = new Map<string, number>()
    typeFiltered.forEach((d) => counts.set(d.brandId, (counts.get(d.brandId) ?? 0) + 1))
    return brands.filter((b) => counts.has(b.id)).map((b) => ({ ...b, count: counts.get(b.id) ?? 0 }))
  }, [brands, typeFiltered])

  const openEdit = (device: Device) => {
    setEditing(device)
    setForm({
      brandId: device.brandId,
      brandName: device.brandName,
      model: device.model,
      deviceType: device.deviceType,
      status: device.status,
    })
    setModalOpen(true)
  }

  const { rowHighlightClass } = useDeepLinkRecord({
    items: filtered,
    getId: (d) => d.id,
    onOpen: openEdit,
  })

  const handleTypeChange = (type: DeviceType) => {
    setDeviceType(type)
    goToPage(1)
    const next = new URLSearchParams(searchParams)
    next.set('type', type)
    setSearchParams(next, { replace: true })
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyDevice, deviceType })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const brand = brands.find((b) => b.id === form.brandId)
      const payload = { ...form, brandName: brand?.name || form.brandName }
      if (editing) {
        await deviceService.update(editing.id, payload)
        toast.success('Device updated successfully')
      } else {
        await deviceService.create(payload)
        toast.success('Device added successfully')
      }
      setModalOpen(false)
      await load()
    } catch {
      toast.error('Failed to save device')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      await deviceService.delete(deleting.id)
      toast.success('Device deleted')
      setDeleteOpen(false)
      await load()
    } catch {
      toast.error('Failed to delete device')
    } finally {
      setSaving(false)
    }
  }

  if (loading && devices.length === 0) return <PageSkeleton />

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error('No devices to export')
      return
    }
    exportToCsv('devices-export', filtered, [
      { header: 'Brand', value: (d) => d.brandName },
      { header: 'Model', value: (d) => d.model },
      { header: 'Type', value: (d) => d.deviceType },
      { header: 'Status', value: (d) => d.status },
      { header: 'Created', value: (d) => d.createdAt },
    ])
    toast.success(`Exported ${filtered.length} devices`)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Devices' }]} />

      <DeviceTypeToggle
        value={deviceType}
        onChange={handleTypeChange}
        mobileCount={deviceCounts.mobile}
        laptopCount={deviceCounts.laptop}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {brandsInView.map((brand) => (
          <Card key={brand.id} hover className="p-4">
            <p className="text-xs text-text-secondary">{brand.name}</p>
            <p className="text-lg font-bold text-text mt-1">{brand.count}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Device Models"
          subtitle={`${filtered.length} ${deviceType} devices`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ExportCsvButton onClick={handleExportCsv} disabled={filtered.length === 0} />
              <Button onClick={openCreate}>
                <Plus size={18} />
                Add Device
              </Button>
            </div>
          }
        />
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-6">
          <PageSearchInput
            placeholder={`Search ${deviceType} devices...`}
            value={search}
            onChange={(e) => {
              setLoading(true)
              setSearch(e.target.value)
            }}
          />
          <Select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Brands' },
              ...brandsInView.map((b) => ({ value: b.id, label: b.name })),
            ]}
            className="sm:w-48"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Smartphone}
            title="No Devices Found"
            description={`No ${deviceType} devices match your filters.`}
            actionLabel="Add Device"
            onAction={openCreate}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Brand</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Model</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Created</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((device) => (
                    <tr
                      key={device.id}
                      id={`record-${device.id}`}
                      className={`border-b border-border/50 hover:bg-white/[0.02] ${rowHighlightClass(device.id)}`}
                    >
                      <td className="py-3 px-4 text-sm text-text">{device.brandName}</td>
                      <td className="py-3 px-4 text-sm font-medium text-text">{device.model}</td>
                      <td className="py-3 px-4">
                        <Badge variant={device.status === 'active' ? 'success' : 'default'}>{device.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {new Date(device.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(device)}
                            className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleting(device)
                              setDeleteOpen(true)
                            }}
                            className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Device' : 'Add Device'}>
        <div className="space-y-4">
          <Select
            label="Brand"
            value={form.brandId}
            onChange={(e) => setForm({ ...form, brandId: e.target.value })}
            options={brands.map((b) => ({ value: b.id, label: b.name }))}
          />
          <Input
            label="Model Name"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="iPhone 15 Pro"
          />
          <Select
            label="Device Type"
            value={form.deviceType}
            onChange={(e) => setForm({ ...form, deviceType: e.target.value as Device['deviceType'] })}
            options={[
              { value: 'mobile', label: 'Mobile' },
              { value: 'laptop', label: 'Laptop' },
            ]}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Device"
        message={`Delete ${deleting?.model}? Products linked to this device may be affected.`}
        isLoading={saving}
      />
    </div>
  )
}
