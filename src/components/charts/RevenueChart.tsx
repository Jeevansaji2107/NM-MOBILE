import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RevenueData } from '@/types'
import { formatINR, formatINRCompact } from '@/utils/format'

interface RevenueChartProps {
  data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FC7309" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FC7309" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" vertical={false} />
        <XAxis dataKey="month" stroke="#B3B3B3" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#B3B3B3"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatINRCompact(Number(v))}
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
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#FC7309"
          strokeWidth={2}
          fill="url(#revenueGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
