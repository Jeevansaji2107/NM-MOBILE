import type { Device, DeviceBrand, DeviceType } from '@/types'

const BRAND_IDS: Record<string, string> = {
  Apple: 'b1',
  Samsung: 'b2',
  OnePlus: 'b3',
  Nothing: 'b4',
  Google: 'b5',
  Xiaomi: 'b6',
  Redmi: 'b7',
  Realme: 'b8',
  Vivo: 'b9',
  Oppo: 'b10',
  Motorola: 'b11',
  iQOO: 'b12',
  Dell: 'b13',
  HP: 'b14',
  Lenovo: 'b15',
  ASUS: 'b16',
  Acer: 'b17',
  MSI: 'b18',
}

const MOBILE_CATALOG: { brand: string; models: string[] }[] = [
  { brand: 'Apple', models: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13'] },
  { brand: 'Samsung', models: ['Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25', 'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy Z Fold 6', 'Galaxy Z Flip 6', 'Galaxy A55'] },
  { brand: 'OnePlus', models: ['OnePlus 13', 'OnePlus 12R', 'OnePlus 12', 'OnePlus Nord 4', 'OnePlus Nord CE 4', 'OnePlus Open'] },
  { brand: 'Nothing', models: ['Nothing Phone 3', 'Nothing Phone 2a', 'Nothing Phone 2', 'Nothing Phone 1', 'Nothing CMF Phone 1'] },
  { brand: 'Google', models: ['Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 8 Pro', 'Pixel 8a', 'Pixel 8', 'Pixel 7a'] },
  { brand: 'Xiaomi', models: ['Xiaomi 14 Ultra', 'Xiaomi 14', 'Xiaomi 13T Pro', 'Xiaomi 13T', 'Xiaomi 12 Pro'] },
  { brand: 'Redmi', models: ['Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13', 'Redmi 13C', 'Redmi K70 Pro', 'Redmi 12'] },
  { brand: 'Realme', models: ['Realme GT 6', 'Realme 12 Pro+', 'Realme 12 Pro', 'Realme Narzo 70 Pro', 'Realme 11 Pro+'] },
  { brand: 'Vivo', models: ['Vivo X100 Pro', 'Vivo X100', 'Vivo V30 Pro', 'Vivo V29', 'Vivo Y100'] },
  { brand: 'Oppo', models: ['Oppo Find X7 Ultra', 'Oppo Find X7', 'Oppo Reno 12 Pro', 'Oppo Reno 11', 'Oppo A79'] },
  { brand: 'Motorola', models: ['Motorola Edge 50 Ultra', 'Motorola Edge 50 Pro', 'Motorola Razr 50 Ultra', 'Motorola G84', 'Motorola G54'] },
  { brand: 'iQOO', models: ['iQOO 12 Pro', 'iQOO 12', 'iQOO Neo 9 Pro', 'iQOO Z9', 'iQOO 11'] },
]

const LAPTOP_CATALOG: { brand: string; models: string[] }[] = [
  { brand: 'Apple', models: ['MacBook Air M3 13"', 'MacBook Air M3 15"', 'MacBook Pro M4 14"', 'MacBook Pro M4 16"', 'MacBook Pro M3 14"', 'MacBook Pro M3 16"'] },
  { brand: 'Dell', models: ['Dell XPS 13', 'Dell XPS 15', 'Dell XPS 14', 'Dell Inspiron 16', 'Dell G15', 'Dell Alienware m16'] },
  { brand: 'HP', models: ['HP Spectre x360', 'HP Envy x360', 'HP Omen 16', 'HP Pavilion 15', 'HP Victus 16', 'HP EliteBook 840'] },
  { brand: 'Lenovo', models: ['Lenovo Legion Pro 5', 'Lenovo Yoga 9i', 'Lenovo ThinkPad X1 Carbon', 'Lenovo IdeaPad Slim 5', 'Lenovo LOQ 15', 'Lenovo Tab P12 Pro'] },
  { brand: 'ASUS', models: ['ASUS ROG Zephyrus G16', 'ASUS Zenbook 14', 'ASUS Vivobook 15', 'ASUS TUF Gaming A15', 'ASUS ProArt Studiobook', 'ASUS ROG Strix G16'] },
  { brand: 'Acer', models: ['Acer Predator Helios 16', 'Acer Swift Go 14', 'Acer Nitro 5', 'Acer Aspire 7', 'Acer Spin 5'] },
  { brand: 'MSI', models: ['MSI Raider GE78', 'MSI Stealth 16', 'MSI Katana 15', 'MSI Modern 14', 'MSI Creator Z17'] },
  { brand: 'Samsung', models: ['Samsung Galaxy Book4 Ultra', 'Samsung Galaxy Book4 Pro', 'Samsung Galaxy Book4', 'Samsung Galaxy Book3 360'] },
]

function buildDevices(catalog: { brand: string; models: string[] }[], deviceType: DeviceType, startId: number): Device[] {
  const list: Device[] = []
  let id = startId
  for (const entry of catalog) {
    for (const model of entry.models) {
      list.push({
        id: `d${id}`,
        brandId: BRAND_IDS[entry.brand],
        brandName: entry.brand,
        model,
        deviceType,
        status: 'active',
        createdAt: '2024-01-15',
      })
      id++
    }
  }
  return list
}

export const deviceBrands: DeviceBrand[] = Object.entries(BRAND_IDS).map(([name, id]) => ({
  id,
  name,
  status: 'active' as const,
  createdAt: '2024-01-01',
}))

const mobileDevices = buildDevices(MOBILE_CATALOG, 'mobile', 1)
const laptopDevices = buildDevices(LAPTOP_CATALOG, 'laptop', mobileDevices.length + 1)

export const devices: Device[] = [...mobileDevices, ...laptopDevices]

export function getMobileDevices(): Device[] {
  return devices.filter((d) => d.deviceType === 'mobile')
}

export function getLaptopDevices(): Device[] {
  return devices.filter((d) => d.deviceType === 'laptop')
}

export function findDevicesForProduct(
  productName: string,
  categoryId: string,
  rand: () => number,
): string[] {
  const name = productName.toLowerCase()

  // Categories that may have mobile-linked products
  // Skins (1) and Cases (2) and Screen Protectors (3) all have mobile subcategories
  // Check product name for device model matches
  const matched = devices.filter(
    (d) => name.includes(d.model.toLowerCase().slice(0, 8)),
  )
  if (matched.length) return matched.slice(0, 2).map((d) => d.id)

  // Try brand match
  const brand = devices.find((d) => name.includes(d.brandName.toLowerCase()))
  if (brand) {
    const sameBrand = devices.filter((d) => d.brandId === brand.brandId)
    return sameBrand.slice(0, 3).map((d) => d.id)
  }

  // For skin/case products with mobile or laptop context, pick from relevant pool
  if (name.includes('laptop') || name.includes('macbook')) {
    return getLaptopDevices().slice(0, randomCount(rand, 2, 3)).map((d) => d.id)
  }

  if (['1', '2', '3'].includes(categoryId)) {
    return getMobileDevices().slice(0, randomCount(rand, 2, 4)).map((d) => d.id)
  }

  return []
}

function randomCount(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}
