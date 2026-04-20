import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export default class OMSClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`https://${context.account}.vtexcommercestable.com.br`, context, options)
  }

  public getOrder(orderId: string, appKey: string, appToken: string) {
    return this.http.get(`/api/oms/pvt/orders/${orderId}`, {
      headers: {
        'X-VTEX-API-AppKey': appKey,
        'X-VTEX-API-AppToken': appToken,
      },
    })
  }
}