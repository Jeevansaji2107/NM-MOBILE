import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TopProduct } from '@/types'
import { formatINR, formatINRCompact } from '@/utils/format'

interface TopProductsChartProps {
  data: TopProduct[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 80, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" horizontal={false} />
        <XAxis
          type="number"
          stroke="#B3B3B3"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatINRCompact(Number(v))}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#B3B3B3"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={75}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#171717',
            border: '1px solid #2C2C2C',
            borderRadius: '8px',
            color: '#FFFFFF',
          }}
          formatter={(value) => [formatINR(Number(value)), 'Revenue']}
        />
        <Bar dataKey="revenue" fill="#FC7309" radius={[0, 4, 4, 0]} name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  )
}
