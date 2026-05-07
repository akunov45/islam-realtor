import { api } from './client'

export interface Property {
    id: string
    title?: string | null | undefined
    address?: string | null | undefined
    price?: number | null | undefined
    rooms?: number | null | undefined
    area?: number | null | undefined
    source?: string | null | undefined
    coverImage?: string | null | undefined
    imagesCount?: number | null | undefined
    createdAt?: string | null | undefined
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
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.results)) return data.results
    return []
},

    async get(id: string): Promise<Property> {
        const { data } = await api.get(`/api/external/properties/${id}/`)
        return data
    },
}