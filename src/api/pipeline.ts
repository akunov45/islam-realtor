import { api } from './client'

export interface PipelineStage {
    id: number
    name: string
    order?: number | undefined
    is_active?: boolean | undefined
}

export interface PipelineStagePayload {
    name: string
    order?: number | undefined
    is_active?: boolean | undefined
}

export interface PipelineQuery {
    search?: string | undefined
    ordering?: string | undefined
    page?: number | undefined
}

export const pipelineApi = {
    async list(params?: PipelineQuery): Promise<PipelineStage[]> {
        const { data } = await api.get('/api/pipeline-stages/', { params })
        return data?.results ?? data ?? []
    },

    async create(payload: PipelineStagePayload): Promise<PipelineStage> {
        const { data } = await api.post('/api/pipeline-stages/', payload)
        return data
    },

    async update(id: number, payload: Partial<PipelineStagePayload>): Promise<PipelineStage> {
        const { data } = await api.patch(`/api/pipeline-stages/${id}/`, payload)
        return data
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/api/pipeline-stages/${id}/`)
    },
}