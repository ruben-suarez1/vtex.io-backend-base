import { ExternalClient, IOContext, InstanceOptions } from '@vtex/api'

export default class ExternalCarrierClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://localhost', context, options)
  }

  public getTracking(baseUrl: string, orderId: string, token?: string) {
    return this.http.get(`${baseUrl}/tracking/${orderId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  }
}