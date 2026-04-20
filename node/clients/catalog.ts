import { ExternalClient, IOContext, InstanceOptions } from '@vtex/api'

export default class CatalogClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`https://${context.account}.vtexcommercestable.com.br`, context, options)
  }

  public getSkuById(skuId: string, appKey: string, appToken: string) {
    return this.http.get(`/api/catalog/pvt/stockkeepingunit/${skuId}`, {
      headers: {
        'X-VTEX-API-AppKey': appKey,
        'X-VTEX-API-AppToken': appToken,
      },
    })
  }
}
