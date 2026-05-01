import { api } from './client'

export interface KpiQuery {
    period?: 'all' | 'day' | 'week' | 'month' | undefined
    department?: string | undefined
}

export const kpiApi = {
    async leadKpis(params?: KpiQuery): Promise<unknown> {
        const { data } = await api.get('/api/kpi/leads/', { params })
        return data
    },

    async leadKpi(id: number): Promise<unknown> {
        const { data } = await api.get(`/api/kpi/leads/${id}/`)
        return data
    },
}