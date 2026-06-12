import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CategoryRevenue, OrderStatusCount } from '@/types'
import { formatINR, formatINRCompact } from '@/utils/format'

const ORANGE = '#FC7309'
const CHART_COLORS = ['#FC7309', '#E56808', '#FF9A4D', '#FFB380', '#FFCC99', '#FFD9B3', '#FFE6CC', '#FFF0E0']

interface CategoryRevenueChartProps {
  data: CategoryRevenue[]
}

export function CategoryRevenueChart({ data }: CategoryRevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" horizontal={false} />
        <XAxis type="number" stroke="#B3B3B3" fontSize={11} tickFormatter={(v) => formatINRCompact(Number(v))} />
        <YAxis type="category" dataKey="category" stroke="#B3B3B3" fontSize={10} width={100} />
        <Tooltip
          contentStyle={{ backgroundColor: '#171717', border: '1px solid #2C2C2C', borderRadius: 8 }}
          formatter={(v) => [formatINR(Number(v)), 'Revenue']}
        />
        <Bar dataKey="revenue" fill={ORANGE} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface OrderStatusChartProps {
  data: OrderStatusCount[]
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  return (
    <div className="flex items-center justify-center gap-6 h-[280px]">
      <ResponsiveContainer width="65%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={115}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: '#171717',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-3">
        {data
  .filter((item) =>
    ['Pending', 'Printing', 'Shipped', 'Delivered'].includes(item.label)
  )
  .map((item, i) => (
          <div
            key={item.status}
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  CHART_COLORS[i % CHART_COLORS.length],
              }}
            />

            <span className="text-sm text-text-secondary">
              {item.label}
            </span>

            <span className="font-semibold text-text">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface BrandRevenueChartProps {
  data: { brand: string; revenue: number }[]
}

export function BrandRevenueChart({ data }: BrandRevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" vertical={false} />
        <XAxis dataKey="brand" stroke="#B3B3B3" fontSize={11} />
        <YAxis stroke="#B3B3B3" fontSize={11} tickFormatter={(v) => formatINRCompact(Number(v))} />
        <Tooltip
          contentStyle={{ backgroundColor: '#171717', border: '1px solid #2C2C2C', borderRadius: 8 }}
          formatter={(v) => [formatINR(Number(v)), 'Revenue']}
        />
        <Bar dataKey="revenue" fill={ORANGE} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface FunnelChartProps {
  data: { step: string; count: number; percentage: number }[]
}

export function FunnelChart({ data }: FunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" horizontal={false} />
        <XAxis type="number" stroke="#B3B3B3" fontSize={11} />
        <YAxis type="category" dataKey="step" stroke="#B3B3B3" fontSize={10} width={90} />
        <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #2C2C2C', borderRadius: 8 }} />
        <Bar dataKey="count" fill={ORANGE} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CityBarChartProps {
  data: { city: string; value: number }[]
  valueLabel: string
  formatValue?: (v: number) => string
}

export function CityBarChart({ data, valueLabel, formatValue }: CityBarChartProps) {
  const chartData = data.map((d) => ({ city: d.city, value: d.value }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" horizontal={false} />
        <XAxis
          type="number"
          stroke="#B3B3B3"
          fontSize={11}
          tickFormatter={(v) => (formatValue ? formatValue(Number(v)) : String(v))}
        />
        <YAxis type="category" dataKey="city" stroke="#B3B3B3" fontSize={10} width={100} />
        <Tooltip
          contentStyle={{ backgroundColor: '#171717', border: '1px solid #2C2C2C', borderRadius: 8 }}
          formatter={(v) => [formatValue ? formatValue(Number(v)) : Number(v), valueLabel]}
        />
        <Bar dataKey="value" fill={ORANGE} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CityCustomerChartProps {
  data: { city: string; customers: number }[]
}

export function CityCustomerChart({ data }: CityCustomerChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="customers"
          nameKey="city"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #2C2C2C', borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface CouponChartProps {
  data: { code: string; usageCount: number; revenue: number }[]
}

export function CouponChart({ data }: CouponChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" vertical={false} />
        <XAxis dataKey="code" stroke="#B3B3B3" fontSize={11} />
        <YAxis stroke="#B3B3B3" fontSize={11} />
        <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #2C2C2C', borderRadius: 8 }} />
        <Bar dataKey="usageCount" fill={ORANGE} name="Usage" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
