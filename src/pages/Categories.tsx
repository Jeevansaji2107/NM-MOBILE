import { useEffect, useState } from 'react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Card } from '@/components/ui/Card'
import { categoryService } from '@/services/categoryService'
import type { Category } from '@/types'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: '',
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
    })

    setShowAddCategory(false)
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

            <button className='px-4 py-2 bg-primary text-white rounded-lg'>
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
                    <button className='px-3 py-1 bg-primary text-white rounded-lg text-sm'>
                      Edit
                    </button>
                  </td>{' '}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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

              <input
                type='text'
                placeholder='Image URL'
                value={newCategory.image}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    image: e.target.value,
                  })
                }
                className='w-full px-4 py-2 rounded-lg border border-border bg-background text-text'
              />
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
    </div>
  )
}
