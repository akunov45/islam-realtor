import { api } from './client'

export interface PipelineStage {
  id: number
  name: string
  order: number
  is_active: boolean
}

export const pipelineApi = {
  async list(): Promise<PipelineStage[]> {
    const { data } = await api.get('/api/pipeline-stages/')
    return data?.results ?? data
  },

  async create(payload: { name: string; order?: number }): Promise<PipelineStage> {
    const { data } = await api.post('/api/pipeline-stages/', payload)
    return data
  },

  async update(id: number, payload: Partial<PipelineStage>): Promise<PipelineStage> {
    const { data } = await api.patch(`/api/pipeline-stages/${id}/`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/pipeline-stages/${id}/`)
  },
}