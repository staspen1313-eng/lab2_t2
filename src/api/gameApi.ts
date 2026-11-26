import type {
  BrewResponse,
  CatalogResponse,
  CustomerOrder,
  SaleResponse,
} from '../../shared/contracts.ts'
import { apiClient } from './apiClient.ts'

interface SaleRequest {
  potionId: string
  requestedPotionId: string
  tradeBonusPercent: number
  tip: number
}

export const gameApi = {
  async getCatalog(): Promise<CatalogResponse> {
    const response = await apiClient.get<CatalogResponse>('/catalog')
    return response.data
  },

  async getOrders(
    count: number,
    excludedPotionIds: string[] = [],
  ): Promise<CustomerOrder[]> {
    const params = excludedPotionIds.length > 0
      ? { count, excludePotionIds: excludedPotionIds.join(',') }
      : { count }
    const response = await apiClient.get<CustomerOrder[]>('/orders', {
      params,
    })
    return response.data
  },

  async brew(ingredientIds: [string, string]): Promise<BrewResponse> {
    const response = await apiClient.post<BrewResponse>('/brew', {
      ingredientIds,
    })
    return response.data
  },

  async sell(request: SaleRequest): Promise<SaleResponse> {
    const response = await apiClient.post<SaleResponse>('/sell', request)
    return response.data
  },
}
