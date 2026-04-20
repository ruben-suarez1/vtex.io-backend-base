import type { ServiceContext, RecorderState } from '@vtex/api'
import type { Clients } from '../clients'

export interface State extends RecorderState {
  requestId?: string
}

export type Context = ServiceContext<Clients, State>
export type MiddlewareNext = () => Promise<void>
