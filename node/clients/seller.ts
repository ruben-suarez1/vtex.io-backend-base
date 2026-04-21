import { ExternalClient, IOContext, InstanceOptions } from '@vtex/api'

export default class SellerClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`https://${context.account}.vtexcommercestable.com.br`, context, options)
  }

  public getAll(appKey: string, appToken: string) {
    return this.http.get('/api/seller-register/pvt/sellers', {
      headers: {
        'X-VTEX-API-AppKey': appKey,
        'X-VTEX-API-AppToken': appToken,
      },
    })
  }
}
