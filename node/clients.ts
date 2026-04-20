import { IOClients, Apps } from '@vtex/api'
import OMSClient from './clients/oms'
import ExternalCarrierClient from './clients/externalCarrier'

export class Clients extends IOClients {
  public get apps() {
    return this.getOrSet('apps', Apps)
  }

  public get oms() {
    return this.getOrSet('oms', OMSClient)
  }

  public get externalCarrier() {
    return this.getOrSet('externalCarrier', ExternalCarrierClient)
  }
}