import { IOClients, Apps } from '@vtex/api'
import OMSClient from './clients/oms'
import ExternalCarrierClient from './clients/externalCarrier'
import InventoryClient from './clients/inventory'
import CatalogClient from './clients/catalog'

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

  public get inventory() {
    return this.getOrSet('inventory', InventoryClient)
  }

  public get catalog() {
    return this.getOrSet('catalog', CatalogClient)
  }
}