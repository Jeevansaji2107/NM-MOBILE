import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CustomerGrowthData } from '@/types'

interface CustomerGrowthChartProps {
  data: CustomerGrowthData[]
}

export function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" vertical={false} />
        <XAxis dataKey="month" stroke="#B3B3B3" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#B3B3B3" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#171717',
            border: '1px solid #2C2C2C',
            borderRadius: '8px',
            color: '#FFFFFF',
          }}
        />
        <Bar dataKey="newCustomers" fill="#FC7309" radius={[4, 4, 0, 0]} name="New Customers" />
      </BarChart>
    </ResponsiveContainer>
  )
}
