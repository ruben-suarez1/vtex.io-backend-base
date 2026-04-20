import { method, Service } from '@vtex/api'
import type { ParamsContext } from '@vtex/api'
import { Clients } from './clients'
import type { State } from './typings/context'
import { errorHandler } from './middlewares/errorHandler'
import { requestLogger } from './middlewares/requestLogger'
import { healthcheck } from './routes/healthcheck'
import { trackingRoute } from './routes/tracking'

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
      GET: [errorHandler, requestLogger, healthcheck],
    }),
    tracking: method({
      GET: [errorHandler, requestLogger, trackingRoute],
    }),
  },
})
