import { useEffect, useState } from 'react'
import { Tags } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { categoryService } from '@/services/categoryService'
import type { Category } from '@/types'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    categoryService.getAll().then(setCategories)
  }, [])

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Categories' }]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} hover className="group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:glow-orange transition-all">
                <Tags size={22} className="text-primary" />
              </div>
              <Badge variant={category.status === 'active' ? 'success' : 'default'}>
                {category.status}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-text mb-1">{category.name}</h3>
            <p className="text-sm text-text-secondary mb-3">{category.description}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {category.subcategories.map((sub) => (
                <span
                  key={sub.id}
                  className="px-2 py-0.5 rounded text-xs bg-white/5 text-text-secondary border border-border"
                >
                  {sub.name}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-text-secondary">
                {category.productCount} products
              </span>
              <span className="text-xs text-text-secondary">
                Created {new Date(category.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="All Categories" subtitle="Manage product categories" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Description</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Subcategories</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Products</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase">Created</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-text">{category.name}</td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{category.description}</td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {category.subcategories.map((sub) => (
                        <span
                          key={sub.id}
                          className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-text-secondary border border-border"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text">{category.productCount}</td>
                  <td className="py-3 px-4">
                    <Badge variant={category.status === 'active' ? 'success' : 'default'}>
                      {category.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
