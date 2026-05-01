import { api } from './client'

export interface Property {
    id: string | number
    title?: string | null | undefined
    address?: string | null | undefined
    price?: string | number | null | undefined
    rooms?: number | null | undefined
    area?: number | null | undefined
    [key: string]: unknown
}

export interface PropertiesQuery {
    price_min?: string | undefined
    price_max?: string | undefined
    rooms?: number | undefined
    area_min?: string | undefined
    page?: number | undefined
}

export const propertiesApi = {
    async list(params?: PropertiesQuery): Promise<Property[]> {
    const { data } = await api.get('/api/external/properties/', { params })
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.data)) return data.data
    return []
},

    async get(id: string): Promise<Property> {
        const { data } = await api.get(`/api/external/properties/${id}/`)
        return data
    },
}