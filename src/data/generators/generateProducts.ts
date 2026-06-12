import type { Category, Product, Variant } from '@/types'
import { createSeededRandom, formatDate, randomInt } from './seedUtils'
import { devices } from './generateDevices'

const rand = createSeededRandom(42)

const mobilePool = devices.filter((d) => d.deviceType === 'mobile')
const laptopPool = devices.filter((d) => d.deviceType === 'laptop')

export const categories: Category[] = [
  {
    id: '1',
    name: 'Skins',
    description: 'Premium skins for devices',
    image: 'https://picsum.photos/seed/skins/100/100',
    subcategories: [
      { id: '1-1', name: 'Mobile', status: 'active', createdAt: '2024-01-15' },
      { id: '1-2', name: 'Laptop', status: 'active', createdAt: '2024-01-15' },
      {
        id: '1-3',
        name: 'Camera Body',
        status: 'active',
        createdAt: '2024-01-15',
      },
      {
        id: '1-4',
        name: 'Camera Lens',
        status: 'active',
        createdAt: '2024-01-15',
      },
      {
        id: '1-5',
        name: 'Gaming Console',
        status: 'active',
        createdAt: '2024-01-15',
      },
      { id: '1-6', name: 'GoPro', status: 'active', createdAt: '2024-01-15' },
      { id: '1-7', name: 'Buds', status: 'active', createdAt: '2024-01-15' },
      { id: '1-8', name: 'Car Key', status: 'active', createdAt: '2024-01-15' },
      { id: '1-9', name: 'Charger', status: 'active', createdAt: '2024-01-15' },
      { id: '1-10', name: 'Drone', status: 'active', createdAt: '2024-01-15' },
      { id: '1-11', name: 'Gimbal', status: 'active', createdAt: '2024-01-15' },
      { id: '1-12', name: 'Flash', status: 'active', createdAt: '2024-01-15' },
    ],
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Cases',
    description: 'Protective cases',
    image: 'https://picsum.photos/seed/cases/100/100',
    subcategories: [
      { id: '2-1', name: 'Mobile', status: 'active', createdAt: '2024-01-20' },
      { id: '2-2', name: 'Laptop', status: 'active', createdAt: '2024-01-20' },
    ],
    status: 'active',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Screen Protectors',
    description: 'Screen protection films',
    image: 'https://picsum.photos/seed/protectors/100/100',
    subcategories: [
      { id: '3-1', name: 'Mobile', status: 'active', createdAt: '2024-02-15' },
      { id: '3-2', name: 'Laptop', status: 'active', createdAt: '2024-02-15' },
    ],
    status: 'active',
    createdAt: '2024-02-15',
  },
]

function skuPrefix(categoryId: string): string {
  const map: Record<string, string> = {
    '1': 'NM-SK',
    '2': 'NM-CS',
    '3': 'NM-SP',
  }
  return map[categoryId] ?? 'NM-PR'
}

function makeProduct(
  id: number,
  categoryId: string,
  subcategoryId: string,
  variant: Variant | undefined,
  name: string,
  price: number,
  stock: number,
  tags: string[],
  compatibleDeviceIds: string[],
): Product {
  const category = categories.find((c) => c.id === categoryId)!
  return {
    id: String(id),
    name,
    sku: `${skuPrefix(categoryId)}-${String(id).padStart(3, '0')}`,
    description: `Premium NM Skins ${category.name.toLowerCase()} — ${name}`,
    price,
    categoryId,
    categoryName: category.name,
    subcategoryId,
    variant,
    stock,
    status: stock < 15 ? 'inactive' : 'active',
    image: `https://picsum.photos/seed/nm-${id}/200/200`,
    tags,
    compatibleDeviceIds,
    createdAt: formatDate(randomInt(rand, 30, 300)),
  }
}

const rawProducts: Product[] = []
let idCounter = 1

// Skins products (12 subcategories * 4 products = 48)
const skinsSubcategories = categories.find((c) => c.id === '1')!.subcategories
const skinsProductNames = [
  'Transparent',
  'Plain',
  'Premium Matte',
  'Premium Embossed',
]
skinsSubcategories.forEach((sub) => {
  skinsProductNames.forEach((name) => {
    let price = 599
    if (sub.name === 'Laptop') price = 1299
    else if (sub.name === 'Gaming Console') price = 999
    else if (sub.name === 'Camera Body') price = 899
    else if (sub.name === 'Charger') price = 399
    else if (sub.name === 'Buds') price = 499

    let compatDevices: string[] = []
    if (sub.name === 'Mobile') {
      compatDevices = mobilePool.map((d) => d.id)
    } else if (sub.name === 'Laptop') {
      compatDevices = laptopPool.map((d) => d.id)
    }

    const tags = ['skin', sub.name.toLowerCase(), name.toLowerCase()]

    rawProducts.push(
      makeProduct(
        idCounter++,
        '1',
        sub.id,
        name,
        name,
        price,
        randomInt(rand, 30, 250),
        tags,
        compatDevices,
      ),
    )
  })
})

// Cases products (2 subcategories * 2 products = 4)
const casesSubcategories = categories.find((c) => c.id === '2')!.subcategories
const casesProductNames = ['Hard Case', 'Soft Case']
casesSubcategories.forEach((sub) => {
  casesProductNames.forEach((name) => {
    let price = 699
    if (sub.name === 'Laptop') price = 1599

    let compatDevices: string[] = []
    if (sub.name === 'Mobile') {
      compatDevices = mobilePool.map((d) => d.id)
    } else if (sub.name === 'Laptop') {
      compatDevices = laptopPool.map((d) => d.id)
    }

    const tags = [
      'case',
      sub.name.toLowerCase(),
      name.toLowerCase().split(' ')[0],
    ]

    rawProducts.push(
      makeProduct(
        idCounter++,
        '2',
        sub.id,
        name,
        name,
        price,
        randomInt(rand, 40, 200),
        tags,
        compatDevices,
      ),
    )
  })
})

// Screen Protector products (2 subcategories * 3 products = 6)
const spSubcategories = categories.find((c) => c.id === '3')!.subcategories
const spProductNames = ['Clear', 'Matte', 'Privacy']
spSubcategories.forEach((sub) => {
  spProductNames.forEach((name) => {
    let price = 399
    if (sub.name === 'Laptop') price = 899

    let compatDevices: string[] = []
    if (sub.name === 'Mobile') {
      compatDevices = mobilePool.map((d) => d.id)
    } else if (sub.name === 'Laptop') {
      compatDevices = laptopPool.map((d) => d.id)
    }

    const tags = [
      'screen-protector',
      sub.name.toLowerCase(),
      name.toLowerCase(),
    ]

    rawProducts.push(
      makeProduct(
        idCounter++,
        '3',
        sub.id,
        name,
        name,
        price,
        randomInt(rand, 50, 300),
        tags,
        compatDevices,
      ),
    )
  })
})

export const products: Product[] = rawProducts

categories.forEach((cat) => {
  cat.productCount = products.filter((p) => p.categoryId === cat.id).length
})

export const productDeviceMap: Record<string, string[]> = Object.fromEntries(
  products.map((p) => [p.id, p.compatibleDeviceIds]),
)
