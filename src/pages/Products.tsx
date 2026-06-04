import { useCallback, useEffect, useState } from 'react'
import { Edit2, Package, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { DeviceSelector } from '@/components/ui/DeviceSelector'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExportCsvButton } from '@/components/ui/ExportCsvButton'
import { Input } from '@/components/ui/Input'
import { PageSearchInput } from '@/components/ui/PageSearchInput'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { ProductThumbnail } from '@/components/ui/ProductThumbnail'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { Select } from '@/components/ui/Select'
import { StockBadge } from '@/components/ui/StockBadge'
import { deviceService } from '@/services/deviceService'
import { useAsyncList } from '@/hooks/useAsyncList'
import { useDeepLinkRecord } from '@/hooks/useDeepLinkRecord'
import { usePagination } from '@/hooks/usePagination'
import { useToast } from '@/hooks/useToast'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { exportToCsv } from '@/utils/exportCsv'
import { countLowStock } from '@/utils/stockAlerts'
import { formatINR } from '@/utils/format'
import type { Device, Product } from '@/types'

const emptyProduct: Omit<Product, 'id' | 'createdAt'> = {
  name: '',
  sku: '',
  description: '',
  price: 0,
  categoryId: '1',
  categoryName: 'Skins',
  subcategoryId: '',
  variant: '',
  stock: 0,
  status: 'active',
  image: '',
  tags: [],
  compatibleDeviceIds: [],
}

export default function Products() {
  const toast = useToast()
  const [allDevices, setAllDevices] = useState<Device[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<Omit<Product, 'id' | 'createdAt'>>(emptyProduct)
  const [saving, setSaving] = useState(false)

  const categories = productService.getCategories()

  const {
    items: products,
    loading,
    setLoading,
    reload: loadProducts,
  } = useAsyncList(
    () => (search ? productService.search(search) : productService.getAll()),
    [search],
  )

  useEffect(() => {
    deviceService.getAll().then(setAllDevices)
  }, [])

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  const { page, totalPages, paginatedItems, goToPage, total } = usePagination(filteredProducts, 10)

  const openCreate = () => {
    setEditingProduct(null)
    setForm(emptyProduct)
    setModalOpen(true)
  }

  const openEdit = useCallback((product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      subcategoryId: product.subcategoryId || '',
      variant: product.variant || '',
      stock: product.stock,
      status: product.status,
      image: product.image,
      tags: product.tags,
      compatibleDeviceIds: product.compatibleDeviceIds,
    })
    setModalOpen(true)
  }, [])

  const { rowHighlightClass } = useDeepLinkRecord({
    items: filteredProducts,
    getId: (p) => p.id,
    onOpen: (product) => {
      const idx = filteredProducts.findIndex((p) => p.id === product.id)
      if (idx >= 0) goToPage(Math.floor(idx / 10) + 1)
      openEdit(product)
    },
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, form)
        toast.success('Product updated successfully')
      } else {
        await productService.create(form)
        toast.success('Product created successfully')
      }
      setModalOpen(false)
      await loadProducts()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingProduct) return
    setSaving(true)
    try {
      await productService.delete(deletingProduct.id)
      toast.success('Product deleted')
      setDeleteModalOpen(false)
      setDeletingProduct(null)
      await loadProducts()
    } finally {
      setSaving(false)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    setForm({
      ...form,
      categoryId,
      categoryName: cat?.name || '',
      subcategoryId: '',
      variant: '',
    })
  }

  const stockCounts = countLowStock(filteredProducts)

  const handleExportCsv = () => {
    if (filteredProducts.length === 0) {
      toast.error('No products to export')
      return
    }
    exportToCsv('products-export', filteredProducts, [
      { header: 'Name', value: (p) => p.name },
      { header: 'SKU', value: (p) => p.sku },
      { header: 'Category', value: (p) => p.categoryName },
      {
        header: 'Subcategory',
        value: (p) => p.subcategoryId ? categoryService.getSubcategoryName(p.subcategoryId) : '',
      },
      { header: 'Variant', value: (p) => p.variant || '' },
      { header: 'Price (INR)', value: (p) => p.price },
      { header: 'Stock', value: (p) => p.stock },
      { header: 'Status', value: (p) => p.status },
      { header: 'Tags', value: (p) => p.tags.join('; ') },
      {
        header: 'Compatible Devices',
        value: (p) =>
          deviceService
            .getByIds(p.compatibleDeviceIds)
            .map((d) => d.model)
            .join('; ') || 'Universal',
      },
    ])
    toast.success(`Exported ${filteredProducts.length} products`)
  }

  if (loading && products.length === 0) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Products' }]} />
      <Card>
        <CardHeader
          title="Products"
          subtitle={`${filteredProducts.length} products${stockCounts.total > 0 ? ` · ${stockCounts.total} low stock` : ''}`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ExportCsvButton onClick={handleExportCsv} disabled={filteredProducts.length === 0} />
              <Button onClick={openCreate}>
                <Plus size={18} />
                Add Product
              </Button>
            </div>
          }
        />

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-6">
          <PageSearchInput
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setLoading(true)
              setSearch(e.target.value)
            }}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            className="sm:w-48"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            className="sm:w-40"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState icon={Package} title="No Products Found" description="Start building your catalog with premium skins, cases, and accessories." actionLabel="Add Product" onAction={openCreate} />
        ) : (
          <>
            <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Product</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">SKU</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Category</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Price</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Stock</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Compatible Devices</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Tags</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((product) => (
                <tr
                  key={product.id}
                  id={`record-${product.id}`}
                  className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${rowHighlightClass(product.id)}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <ProductThumbnail categoryName={product.categoryName} tags={product.tags} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text truncate max-w-[180px]">{product.name}</p>
                          {product.variant && product.variant !== product.name && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                              {product.variant}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate max-w-[220px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary font-mono">{product.sku}</td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    <div>{product.categoryName}</div>
                    {product.subcategoryId && (
                      <div className="text-[11px] text-text-secondary/60 mt-0.5">
                        {categoryService.getSubcategoryName(product.subcategoryId)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-text">{formatINR(product.price)}</td>
                  <td className="py-3 px-4">
                    <StockBadge stock={product.stock} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {deviceService.getByIds(product.compatibleDeviceIds).slice(0, 2).map((d) => (
                        <span key={d.id} className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                          {d.model.replace(`${d.brandName} `, '')}
                        </span>
                      ))}
                      {product.compatibleDeviceIds.length > 2 && (
                        <span className="text-xs text-text-secondary">+{product.compatibleDeviceIds.length - 2}</span>
                      )}
                      {product.compatibleDeviceIds.length === 0 && (
                        <span className="text-xs text-text-secondary">Universal</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded text-xs bg-white/5 text-text-secondary border border-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={product.status === 'active' ? 'success' : 'default'}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingProduct(product)
                          setDeleteModalOpen(true)
                        }}
                        className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="NM-MS-000"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              min={199}
              max={2499}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <Input
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subcategory"
              value={form.subcategoryId || ''}
              onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
              options={[
                { value: '', label: 'Select Subcategory' },
                ...(categories.find((c) => c.id === form.categoryId)?.subcategories || []).map((s) => ({
                  value: s.id,
                  label: s.name,
                })),
              ]}
            />
            <Input
              label="Variant"
              value={form.variant || ''}
              onChange={(e) => setForm({ ...form, variant: e.target.value })}
              placeholder="e.g. Matte, Plain, Clear"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Compatible Devices</label>
            <DeviceSelector
              devices={allDevices}
              selectedIds={form.compatibleDeviceIds}
              onChange={(ids) => setForm({ ...form, compatibleDeviceIds: ids })}
            />
          </div>
          <Input
            label="Tags (comma separated)"
            value={form.tags.join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
              })
            }
            placeholder="iphone, premium, carbon-fiber"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${deletingProduct?.name}?`}
        isLoading={saving}
      />
    </div>
  )
}
