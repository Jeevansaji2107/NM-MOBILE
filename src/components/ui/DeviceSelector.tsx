import type { Device } from '@/types'

interface DeviceSelectorProps {
  devices: Device[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function DeviceSelector({ devices, selectedIds, onChange }: DeviceSelectorProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const grouped = devices.reduce<Record<string, Device[]>>((acc, d) => {
    if (!acc[d.brandName]) acc[d.brandName] = []
    acc[d.brandName].push(d)
    return acc
  }, {})

  return (
    <div className="space-y-3 max-h-48 overflow-y-auto p-3 rounded-lg border border-border bg-background">
      {Object.entries(grouped).map(([brand, brandDevices]) => (
        <div key={brand}>
          <p className="text-xs font-medium text-text-secondary mb-1.5">{brand}</p>
          <div className="flex flex-wrap gap-1.5">
            {brandDevices.map((device) => {
              const selected = selectedIds.includes(device.id)
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => toggle(device.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    selected
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-card text-text-secondary border border-border hover:border-primary/30'
                  }`}
                >
                  {device.model.replace(`${brand} `, '')}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
