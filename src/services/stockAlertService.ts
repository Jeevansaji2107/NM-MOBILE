import { productService } from '@/services/productService'
import { notificationService } from '@/services/notificationService'

export const stockAlertService = {
  async syncFromStore(): Promise<void> {
    const products = await productService.getAll()
    await notificationService.syncStockAlerts(products)
  },
}
