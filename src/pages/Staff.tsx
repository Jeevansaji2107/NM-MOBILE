import { useEffect, useMemo, useState } from 'react'
import { Shield } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { PageSearchInput } from '@/components/ui/PageSearchInput'
import { allPermissions, roleLabels } from '@/data/mockData'
import { staffService } from '@/services/staffService'
import type { StaffMember, StaffRole } from '@/types'

const roleOptions: { value: StaffRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
]

const roleColors: Record<StaffRole, string> = {
  super_admin: 'primary',
  admin: 'info',
  manager: 'warning',
  staff: 'default',
}

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return staff
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q),
    )
  }, [staff, search])

  useEffect(() => {
    staffService.getAll().then(setStaff)
  }, [])

  const handleRoleChange = async (id: string, role: StaffRole) => {
    const updated = await staffService.updateRole(id, role)
    setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)))
  }

  const togglePermission = async (member: StaffMember, permission: string) => {
    const hasPermission = member.permissions.includes(permission) || member.permissions.includes('all')
    let newPermissions: string[]

    if (member.permissions.includes('all')) {
      newPermissions = allPermissions.filter((p) => p !== permission)
    } else if (hasPermission) {
      newPermissions = member.permissions.filter((p) => p !== permission)
    } else {
      newPermissions = [...member.permissions, permission]
    }

    const updated = await staffService.updatePermissions(member.id, newPermissions)
    setStaff((prev) => prev.map((s) => (s.id === member.id ? updated : s)))
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Staff' }]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleOptions.map(({ value, label }) => {
          const count = staff.filter((s) => s.role === value).length
          return (
            <Card key={value} hover>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Shield size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">{label}</p>
                  <p className="text-xl font-bold text-text">{count}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader title="Staff Members" subtitle={`${filteredStaff.length} team members`} />
        <div className="mb-6">
          <PageSearchInput
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          {filteredStaff.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">No staff match your search</p>
          ) : (
          filteredStaff.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-border hover:border-primary/20 transition-all duration-200"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{member.name}</p>
                    <p className="text-xs text-text-secondary">{member.email} · {member.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={roleColors[member.role] as 'primary' | 'info' | 'warning' | 'default'}>
                    {roleLabels[member.role]}
                  </Badge>
                  <Badge variant={member.status === 'active' ? 'success' : 'default'}>
                    {member.status}
                  </Badge>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as StaffRole)}
                      options={roleOptions}
                      className="w-36"
                    />
                  </div>
                </div>
              </div>

              {expandedId === member.id && (
                <div className="px-4 pb-4 border-t border-border pt-4">
                  <p className="text-sm font-medium text-text mb-3">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {allPermissions.map((permission) => {
                      const hasAccess =
                        member.permissions.includes('all') || member.permissions.includes(permission)
                      return (
                        <button
                          key={permission}
                          onClick={() => togglePermission(member, permission)}
                          disabled={member.role === 'super_admin'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                            hasAccess
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'bg-background text-text-secondary border border-border hover:border-primary/30'
                          } ${member.role === 'super_admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {permission}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )))}
        </div>
      </Card>
    </div>
  )
}
