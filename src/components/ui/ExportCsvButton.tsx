import { Download } from 'lucide-react'
import { Button } from './Button'

interface ExportCsvButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function ExportCsvButton({ onClick, disabled }: ExportCsvButtonProps) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick} disabled={disabled} type="button">
      <Download size={16} aria-hidden />
      Export CSV
    </Button>
  )
}
