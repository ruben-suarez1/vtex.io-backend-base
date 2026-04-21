import { ExternalClient, IOContext, InstanceOptions } from '@vtex/api'

export default class InventoryClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`https://${context.account}.vtexcommercestable.com.br`, context, options)
  }

  public getBySkuId(skuId: string, appKey: string, appToken: string) {
    return this.http.get(`/api/logistics/pvt/inventory/skus/${skuId}`, {
      headers: {
        'X-VTEX-API-AppKey': appKey,
        'X-VTEX-API-AppToken': appToken,
      },
    })
  }
}
