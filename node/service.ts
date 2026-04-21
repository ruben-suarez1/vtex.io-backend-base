import { method, Service } from '@vtex/api'
import type { ParamsContext } from '@vtex/api'
import { Clients } from './clients'
import type { State } from './typings/context'
import { errorHandler } from './middlewares/errorHandler'
import { requestLogger } from './middlewares/requestLogger'
import { requestId } from './middlewares/requestId'
import { responseTime } from './middlewares/responseTime'
import { healthcheck } from './routes/healthcheck'
import { trackingRoute } from './routes/tracking'
import { inventoryRoute } from './routes/inventory'
import { availabilityRoute } from './routes/availability'

export default new Service<Clients, State, ParamsContext>({
  clients: {
    implementation: Clients,
    options: {
      default: {
        retries: 1,
        timeout: 3000,
      },
    },
  },
  routes: {
    healthcheck: method({
      GET: [errorHandler, requestId, responseTime, requestLogger, healthcheck],
    }),
    tracking: method({
      GET: [errorHandler, requestId, responseTime, requestLogger, trackingRoute],
    }),
    inventory: method({
      GET: [errorHandler, requestId, responseTime, requestLogger, inventoryRoute],
    }),
    availability: method({
      GET: [errorHandler, requestId, responseTime, requestLogger, availabilityRoute],
    }),
  },
})
