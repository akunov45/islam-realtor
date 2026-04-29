import { api } from './client'

export interface Property {
  id: string
  title?: string
  address?: string
  price?: string
  rooms?: number
  area?: number
  [key: string]: unknown
}

export const propertiesApi = {
  async list(): Promise<Property[]> {
    const { data } = await api.get('/api/external/properties/')
    return data?.results ?? data
  },

  async get(id: string): Promise<Property> {
    const { data } = await api.get(`/api/external/properties/${id}/`)
    return data
  },
}