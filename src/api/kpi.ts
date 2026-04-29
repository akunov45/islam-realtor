import { api } from './client'

export const kpiApi = {
  async leadKpis(): Promise<unknown> {
    const { data } = await api.get('/api/kpi/leads/')
    return data
  },

  async leadKpi(id: number): Promise<unknown> {
    const { data } = await api.get(`/api/kpi/leads/${id}/`)
    return data
  },
}