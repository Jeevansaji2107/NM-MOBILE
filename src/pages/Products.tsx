import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit2, Eye, Package } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExportCsvButton } from '@/components/ui/ExportCsvButton'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Input } from '@/components/ui/Input'
import { PageSearchInput } from '@/components/ui/PageSearchInput'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { FunnelSortSelect } from '@/components/ui/FunnelSortSelect'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { useAsyncList } from '@/hooks/useAsyncList'
import { useDeepLinkRecord } from '@/hooks/useDeepLinkRecord'
import { usePagination } from '@/hooks/usePagination'
import { useToast } from '@/hooks/useToast'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { exportToCsv } from '@/utils/exportCsv'
import { formatINR } from '@/utils/format'
import type { Product } from '@/types'

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc'

type ProductForm = Omit<Product, 'id' | 'createdAt' | 'compatibleDeviceIds'>

const emptyProduct: ProductForm = {
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
}

function isProductInStock(product: Product): boolean {
  return product.status === 'active' && product.stock > 0
}

function getStockStatus(product: Product): { label: string; variant: 'success' | 'danger' } {
  return isProductInStock(product)
    ? { label: 'In Stock', variant: 'success' }
    : { label: 'Out of Stock', variant: 'danger' }
}

function computeStats(items: Product[]) {
  const inStock = items.filter(isProductInStock).length
  return {
    total: items.length,
    inStock,
    outOfStock: items.length - inStock,
  }
}

function sortProducts(items: Product[], sort: SortOption): Product[] {
  const sorted = [...items]
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case 'stock-asc':
      return sorted.sort((a, b) => a.stock - b.stock)
    case 'stock-desc':
      return sorted.sort((a, b) => b.stock - a.stock)
    case 'newest':
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

function updateProductInList(list: Product[], productId: string, status: Product['status']): Product[] {
  return list.map((p) => (p.id === productId ? { ...p, status } : p))
}

function getProductDisplayId(product: Product): string {
  return product.sku || `PRD-${product.id.slice(-6).padStart(6, '0')}`
}

const emeraldButtonClass =
  'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0'

export default function Products() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [soldCounts, setSoldCounts] = useState<Record<string, number>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyProduct)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const categories = productService.getCategories()

  const {
    items: products,
    setItems,
    loading,
    setLoading,
    reload: loadProducts,
  } = useAsyncList(
    () => (search ? productService.search(search) : productService.getAll()),
    [search],
  )

  const refreshAllProducts = useCallback(async () => {
    const data = await productService.getAll()
    setAllProducts(data)
    return data
  }, [])

  useEffect(() => {
    refreshAllProducts()
    orderService.getAll().then((orders) => {
      const counts: Record<string, number> = {}
      for (const order of orders) {
        for (const item of order.items) {
          counts[item.productId] = (counts[item.productId] ?? 0) + item.quantity
        }
      }
      setSoldCounts(counts)
    })
  }, [refreshAllProducts])

  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort])
  const stats = useMemo(() => computeStats(allProducts), [allProducts])

  const { page, totalPages, paginatedItems, goToPage, total } = usePagination(sortedProducts, 10)

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
    })
    setModalOpen(true)
  }, [])

  const { rowHighlightClass } = useDeepLinkRecord({
    items: sortedProducts,
    getId: (p) => p.id,
    onOpen: (product) => {
      const idx = sortedProducts.findIndex((p) => p.id === product.id)
      if (idx >= 0) goToPage(Math.floor(idx / 10) + 1)
      openEdit(product)
    },
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        compatibleDeviceIds: editingProduct?.compatibleDeviceIds ?? [],
      }
      if (editingProduct) {
        await productService.update(editingProduct.id, payload)
        toast.success('Product updated successfully')
      } else {
        const created = await productService.create({ ...payload, sku: '' })
        toast.success(`Product created — ID: ${created.sku}`)
      }
      setModalOpen(false)
      await loadProducts()
      await refreshAllProducts()
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
      await refreshAllProducts()
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (productId: string, active: boolean) => {
    const nextStatus: Product['status'] = active ? 'active' : 'inactive'
    const previousProducts = products
    const previousAllProducts = allProducts

    setTogglingId(productId)
    setItems((prev) => updateProductInList(prev, productId, nextStatus))
    setAllProducts((prev) => updateProductInList(prev, productId, nextStatus))

    try {
      await productService.update(productId, { status: nextStatus })
      toast.success(active ? 'Product marked in stock' : 'Product marked out of stock')
    } catch {
      setItems(previousProducts)
      setAllProducts(previousAllProducts)
      toast.error('Failed to update product status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    setForm({
      ...form,
      categoryId,
      categoryName: cat?.name || '',
      subcategoryId: '',
    })
  }

  const handleExportCsv = () => {
    if (sortedProducts.length === 0) {
      toast.error('No products to export')
      return
    }
    exportToCsv('products-export', sortedProducts, [
      { header: 'Product ID', value: (p) => getProductDisplayId(p) },
      { header: 'Product Name', value: (p) => p.name },
      { header: 'Category', value: (p) => p.categoryName },
      {
        header: 'Subcategory',
        value: (p) => (p.subcategoryId ? categoryService.getSubcategoryName(p.subcategoryId) : ''),
      },
      { header: 'MRP (INR)', value: (p) => p.price },
      { header: 'Stock', value: (p) => p.stock },
      { header: 'Sold', value: (p) => soldCounts[p.id] ?? 0 },
      { header: 'Status', value: (p) => getStockStatus(p).label },
      { header: 'Active', value: (p) => (p.status === 'active' ? 'Yes' : 'No') },
      { header: 'Tags', value: (p) => p.tags.join('; ') },
    ])
    toast.success(`Exported ${sortedProducts.length} products`)
  }

  if (loading && products.length === 0 && allProducts.length === 0) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Products' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-6">
            <p className="text-sm text-text-secondary">Total Products</p>
            <h2 className="text-3xl font-bold text-text">{stats.total}</h2>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-text-secondary">In Stock</p>
            <h2 className="text-3xl font-bold text-green-500">{stats.inStock}</h2>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-text-secondary">Out of Stock</p>
            <h2 className="text-3xl font-bold text-primary">{stats.outOfStock}</h2>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <PageSearchInput
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setLoading(true)
              setSearch(e.target.value)
            }}
            wrapperClassName="w-full lg:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <button
              type="button"
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              + Add Product
            </button>
            <ExportCsvButton onClick={handleExportCsv} disabled={sortedProducts.length === 0} />
            <FunnelSortSelect
              value={sort}
              onChange={(value) => setSort(value as SortOption)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'name-asc', label: 'Name A–Z' },
                { value: 'name-desc', label: 'Name Z–A' },
                { value: 'stock-asc', label: 'Stock Low–High' },
                { value: 'stock-desc', label: 'Stock High–Low' },
              ]}
            />
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Found"
            description="Start building your catalog with premium skins, cases, and accessories."
            actionLabel="Add Product"
            onAction={openCreate}
          />
        ) : (
          <>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full table-fixed min-w-[1040px]">
                <colgroup>
                  <col className="w-[108px]" />
                  <col className="w-[180px]" />
                  <col className="w-[96px]" />
                  <col className="w-[76px]" />
                  <col className="w-[96px]" />
                  <col className="w-[64px]" />
                  <col className="w-[64px]" />
                  <col className="w-[56px]" />
                  <col className="w-[68px]" />
                  <col className="w-[84px]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wide">Product ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wide">Product Name</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-text-secondary uppercase tracking-wide">MRP</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Discount %</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Price</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wide">Stock</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wide">Coins</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wide">Sold</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wide">Status</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((product) => (
                    <tr
                      key={product.id}
                      id={`record-${product.id}`}
                      className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${rowHighlightClass(product.id)}`}
                    >
                      <td className="py-3 px-4 text-xs font-mono text-text-secondary whitespace-nowrap">
                        {getProductDisplayId(product)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-text truncate" title={product.name}>
                        {product.name}
                      </td>
                      <td className="py-3 px-3 text-sm text-text text-right tabular-nums whitespace-nowrap">
                        {formatINR(product.price)}
                      </td>
                      <td className="py-3 px-3 text-sm font-medium text-emerald-400 text-right tabular-nums">0%</td>
                      <td className="py-3 px-3 text-sm text-text text-right tabular-nums whitespace-nowrap">
                        {formatINR(product.price)}
                      </td>
                      <td className={`py-3 px-2 text-sm font-medium text-right tabular-nums ${product.stock <= 10 ? 'text-red-400' : 'text-text'}`}>
                        {product.stock}
                      </td>
                      <td className="py-3 px-2 text-sm font-medium text-amber-400 text-right tabular-nums">0</td>
                      <td className="py-3 px-2 text-sm text-text-secondary text-right tabular-nums">
                        {soldCounts[product.id] ?? 0}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center">
                          <Switch
                            checked={product.status === 'active'}
                            disabled={togglingId === product.id}
                            onChange={(active) => handleToggleStatus(product.id, active)}
                            label={`Toggle ${product.name} stock status`}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-white/5 transition-colors"
                            aria-label={`View ${product.name}`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit2 size={16} />
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
        size="xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4 pr-1">
            {editingProduct ? (
              <Input
                label="Product ID"
                value={getProductDisplayId(editingProduct)}
                readOnly
                className="font-mono text-text-secondary"
              />
            ) : (
              <p className="text-sm text-text-secondary px-1">
                Product ID will be generated automatically when you save.
              </p>
            )}
            <Input
              label="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Whey Protein Isolate"
            />
            <div>
              <label htmlFor="product-description" className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                id="product-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed product description..."
                rows={3}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200 resize-y min-h-[88px]"
              />
            </div>
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Input
              label="MRP (₹)"
              type="number"
              min={199}
              max={2499}
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              placeholder="e.g., 2999"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Color"
                value={form.tags.join(', ')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g., Black, Red, Blue"
              />
              <Select
                label="Sizes"
                value={form.subcategoryId || ''}
                onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
                options={[
                  { value: '', label: 'Select Sizes' },
                  ...(categories.find((c) => c.id === form.categoryId)?.subcategories || []).map((s) => ({
                    value: s.id,
                    label: s.name,
                  })),
                ]}
              />
            </div>
            <Input
              label="Stock Count (Select 1 size and enter color)"
              type="number"
              value={form.stock || ''}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              placeholder="e.g., 100"
            />
            <div>
              <span className="block text-sm font-medium text-text-secondary mb-2">Status</span>
              <div className="flex items-center gap-3 px-4 py-3 bg-background border border-border rounded-lg">
                <Switch
                  checked={form.status === 'active'}
                  onChange={(active) =>
                    setForm({ ...form, status: active ? 'active' : 'inactive' })
                  }
                  label="Product active status"
                />
                <span className="text-sm text-text-secondary">
                  {form.status === 'active' ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>

          <ImageUpload value={form.image} onChange={(image) => setForm({ ...form, image })} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-border">
          {editingProduct ? (
            <Button
              size="sm"
              onClick={() => {
                setDeletingProduct(editingProduct)
                setDeleteModalOpen(true)
              }}
              className={emeraldButtonClass}
            >
              Delete Product
            </Button>
          ) : (
            <span />
          )}
          <div className="flex justify-end gap-3 ml-auto">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving} className={emeraldButtonClass}>
              Save Product
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
