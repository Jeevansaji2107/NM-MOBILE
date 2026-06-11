import { useEffect, useState } from 'react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Card } from '@/components/ui/Card'
import { categoryService } from '@/services/categoryService'
import type { Category } from '@/types'
import { Pencil } from 'lucide-react'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')

  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddSubcategory, setShowAddSubcategory] = useState(false)

  const [showEditCategory, setShowEditCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active',
  })

  const [newSubcategory, setNewSubcategory] = useState({
    categoryId: '',
    name: '',
    description: '',
    status: 'active',
  })

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active',
  })

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return

    await categoryService.create({
      name: newCategory.name,
      description: newCategory.description,
      image: newCategory.image,
      status: 'active',
      subcategories: [],
    })

    const updated = await categoryService.getAll()
    setCategories(updated)

    setNewCategory({
      name: '',
      description: '',
      image: '',
      status: 'active',
    })

    setShowAddCategory(false)
  }
  const handleAddSubcategory = async () => {
    if (!newSubcategory.name.trim() || !newSubcategory.categoryId) return

    await categoryService.addSubcategory(newSubcategory.categoryId, {
      name: newSubcategory.name,
      description: newSubcategory.description,
      status: newSubcategory.status as 'active' | 'inactive',
    })

    const updated = await categoryService.getAll()
    setCategories(updated)

    setNewSubcategory({
      categoryId: '',
      name: '',
      description: '',
      status: 'active',
    })

    setShowAddSubcategory(false)
  }

  const toggleStatus = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)

    if (!category) return

    const newStatus = category.status === 'active' ? 'inactive' : 'active'

    await categoryService.update(categoryId, {
      status: newStatus,
    })

    const updated = await categoryService.getAll()
    setCategories(updated)
  }
  const handleDeleteCategory = async (categoryId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?',
    )

    if (!confirmed) return

    await categoryService.delete(categoryId)

    const updated = await categoryService.getAll()
    setCategories(updated)
  }
  const handleEditClick = (category: Category) => {
    setEditingCategory(category)

    setEditForm({
      name: category.name,
      description: category.description,
      image: category.image || '',
      status: category.status,
    })

    setShowEditCategory(true)
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    await categoryService.update(editingCategory.id, {
      name: editForm.name,
      description: editForm.description,
      image: editForm.image,
      status: editForm.status as 'active' | 'inactive',
    })

    const updated = await categoryService.getAll()
    setCategories(updated)

    setShowEditCategory(false)
  }
  useEffect(() => {
    categoryService.getAll().then(setCategories)
  }, [])

  const filteredCategories = categories.filter((category) => {
    const query = search.toLowerCase()

    return (
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      category.subcategories.some((sub) =>
        sub.name.toLowerCase().includes(query),
      )
    )
  })
  return (
    <div className='space-y-6'>
      <Breadcrumb items={[{ label: 'Categories' }]} />

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <div className='p-6'>
            <p className='text-sm text-text-secondary'>Total Categories</p>
            <h2 className='text-3xl font-bold text-text'>
              {categories.length}
            </h2>
          </div>
        </Card>

        <Card>
          <div className='p-6'>
            <p className='text-sm text-text-secondary'>Active Categories</p>
            <h2 className='text-3xl font-bold text-green-500'>
              {
                categories.filter((category) => category.status === 'active')
                  .length
              }
            </h2>
          </div>
        </Card>

        <Card>
          <div className='p-6'>
            <p className='text-sm text-text-secondary'>Total Subcategories</p>
            <h2 className='text-3xl font-bold text-primary'>
              {categories.reduce(
                (total, category) => total + category.subcategories.length,
                0,
              )}
            </h2>
          </div>
        </Card>
      </div>
      <div className='flex justify-between items-center'>
        <input
          type='text'
          placeholder='Search categories or subcategories...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full px-4 py-2 rounded-lg border border-border bg-background text-text'
        />
      </div>
      <Card>
        <div className='flex items-center justify-between p-6 border-b border-border'>
          <div>
            <h2 className='text-lg font-semibold text-text'>All Categories</h2>
            <p className='text-sm text-text-secondary'>
              Manage product categories
            </p>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={() => setShowAddCategory(true)}
              className='px-4 py-2 bg-primary text-white rounded-lg'
            >
              + Add Category
            </button>

            <button
              onClick={() => setShowAddSubcategory(true)}
              className='px-4 py-2 bg-primary text-white rounded-lg'
            >
              + Add Subcategory
            </button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border'>
                <th className='text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase'>
                  Image
                </th>

                <th className='text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase'>
                  Name
                </th>

                <th className='text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase'>
                  Description
                </th>

                <th className='text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase'>
                  Products
                </th>

                <th className='text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase'>
                  Status
                </th>

                <th className='text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase'>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className='border-b border-border/50 hover:bg-white/[0.02] transition-colors'
                >
                  <td className='py-3 px-4'>
                    <img
                      src={category.image}
                      alt={category.name}
                      className='w-12 h-12 rounded-lg object-cover border border-border'
                    />
                  </td>
                  <td className='py-3 px-4 text-sm font-medium text-text'>
                    {category.name}
                  </td>
                  <td className='py-3 px-4 text-sm text-text-secondary'>
                    {category.description}
                  </td>
                  <td className='py-3 px-4 text-sm text-text'>
                    {category.productCount}
                  </td>
                  <td className='py-3 px-4'>
                    <button
                      onClick={() => toggleStatus(category.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        category.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          category.status === 'active'
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEditClick(category)}
                        className='p-2 bg-primary text-white rounded-lg'
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showEditCategory && editingCategory && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
          <div className='bg-card border border-border rounded-xl p-6 w-full max-w-md'>
            <h2 className='text-xl font-semibold mb-4'>Edit Category</h2>

            <div className='space-y-4'>
              <input
                type='text'
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    name: e.target.value,
                  })
                }
                className='w-full px-4 py-2 rounded-lg border border-border'
              />

              <input
                type='text'
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    description: e.target.value,
                  })
                }
                className='w-full px-4 py-2 rounded-lg border border-border'
              />

              <input
                type='text'
                value={editForm.image}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    image: e.target.value,
                  })
                }
                className='w-full px-4 py-2 rounded-lg border border-border'
              />
            </div>

            <div className='flex justify-between mt-6'>
              <button
                onClick={() => handleDeleteCategory(editingCategory.id)}
                className='px-4 py-2 bg-red-500 text-white rounded-lg'
              >
                Delete
              </button>

              <div className='flex gap-2'>
                <button
                  onClick={() => setShowEditCategory(false)}
                  className='px-4 py-2 border border-border rounded-lg'
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateCategory}
                  className='px-4 py-2 bg-primary text-white rounded-lg'
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddCategory && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
          <div className='bg-card border border-border rounded-xl p-6 w-full max-w-md'>
            <h2 className='text-xl font-semibold text-text mb-4'>
              Add Category
            </h2>

            <div className='space-y-4'>
              <input
                type='text'
                placeholder='Category Name'
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    name: e.target.value,
                  })
                }
                className='w-full px-4 py-2 rounded-lg border border-border bg-background text-text'
              />

              <input
                type='text'
                placeholder='Description'
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                className='w-full px-4 py-2 rounded-lg border border-border bg-background text-text'
              />

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-text mb-2'>
                    Status
                  </label>

                  <select
                    value={newCategory.status}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        status: e.target.value,
                      })
                    }
                    className='w-full px-4 py-2 rounded-lg border border-border bg-background text-text'
                  >
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-text mb-2'>
                    Category Image
                  </label>

                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0]

                      if (!file) return

                      const imageUrl = URL.createObjectURL(file)

                      setNewCategory({
                        ...newCategory,
                        image: imageUrl,
                      })
                    }}
                    className='w-full px-4 py-2 border border-border rounded-lg'
                  />
                  {newCategory.image && (
                    <img
                      src={newCategory.image}
                      alt='Preview'
                      className='w-full h-40 object-cover rounded-lg border border-border'
                    />
                  )}
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => setShowAddCategory(false)}
                className='px-4 py-2 rounded-lg border border-border'
              >
                Cancel
              </button>

              <button
                onClick={handleAddCategory}
                className='px-4 py-2 bg-primary text-white rounded-lg'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddSubcategory && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
          <div className='bg-card border border-border rounded-xl p-6 w-full max-w-md'>
            <h2 className='text-xl font-semibold mb-4'>Add Subcategory</h2>

            <div className='space-y-4'>
              <select
                value={newSubcategory.categoryId}
                onChange={(e) =>
                  setNewSubcategory({
                    ...newSubcategory,
                    categoryId: e.target.value,
                  })
                }
                className='w-full px-4 py-2 rounded-lg border border-border'
              >
                <option value=''>Select Category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                type='text'
                placeholder='Subcategory Name'
                value={newSubcategory.name}
                onChange={(e) =>
                  setNewSubcategory({
                    ...newSubcategory,
                    name: e.target.value,
                  })
                }
                className='w-full px-4 py-2 rounded-lg border border-border'
              />

              <textarea
                placeholder='Description'
                rows={3}
                value={newSubcategory.description}
                onChange={(e) =>
                  setNewSubcategory({
                    ...newSubcategory,
                    description: e.target.value,
                  })
                }
                className='w-full px-4 py-2 rounded-lg border border-border'
              />
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => setShowAddSubcategory(false)}
                className='px-4 py-2 border border-border rounded-lg'
              >
                Cancel
              </button>

              <button
                onClick={handleAddSubcategory}
                className='px-4 py-2 bg-primary text-white rounded-lg'
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
