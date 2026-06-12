import { Upload } from 'lucide-react'
import { useId } from 'react'

interface ImageUploadProps {
  label?: string
  value?: string
  onChange: (value: string) => void
}

export function ImageUpload({ label = 'Product Images', value, onChange }: ImageUploadProps) {
  const inputId = useId()

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="w-full h-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <label
        htmlFor={inputId}
        className="flex flex-col items-center justify-center w-full min-h-[280px] lg:min-h-[420px] border-2 border-dashed border-border rounded-xl bg-background/50 cursor-pointer hover:border-emerald-500/40 hover:bg-white/[0.02] transition-colors overflow-hidden"
      >
        {value ? (
          <img src={value} alt="Product preview" className="w-full h-full object-cover max-h-[420px]" />
        ) : (
          <>
            <Upload size={32} className="text-text-secondary mb-3" />
            <p className="text-sm text-text-secondary text-center px-4">
              <span className="text-text font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-text-secondary/60 mt-1">PNG, JPG, GIF up to 10MB</p>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  )
}
