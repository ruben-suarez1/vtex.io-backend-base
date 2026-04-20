# VTEX IO Backend Base

Boilerplate enterprise para aplicaciones backend en VTEX IO. Incluye soporte para rutas REST, resolvers GraphQL, clients tipados, middlewares, servicios y manejo de errores estructurado.

---

## Estructura del proyecto

```
.
├── graphql/
│   ├── schema.graphql          # Entry point del schema (queries y mutations)
│   └── types/                  # Tipos GraphQL separados por dominio
│       ├── common.graphql
│       └── tracking.graphql
├── node/
│   ├── index.ts                # Entry point: exporta service (REST) y resolvers (GraphQL)
│   ├── service.ts              # Definición de rutas REST con middlewares
│   ├── clients.ts              # Registro de todos los clients (IOClients)
│   ├── clients/                # Un archivo por client externo
│   │   ├── index.ts
│   │   ├── oms.ts              # JanusClient para OMS de VTEX
│   │   └── externalCarrier.ts  # ExternalClient para carrier externo
│   ├── resolvers/
│   │   ├── index.ts            # Agrupa queries y mutations
│   │   ├── queries/            # Un archivo por query GraphQL
│   │   └── mutations/          # Un archivo por mutation GraphQL
│   ├── routes/                 # Handlers de rutas REST
│   │   ├── healthcheck.ts
│   │   └── tracking.ts
│   ├── services/               # Lógica de negocio desacoplada de transport
│   │   ├── settings/
│   │   │   └── getAppSettings.ts
│   │   └── tracking/
│   │       ├── getTrackingData.ts
│   │       └── normalizeTracking.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts     # Captura AppError y errores no controlados
│   │   └── requestLogger.ts    # Log de entrada/salida de requests
│   ├── errors/
│   │   ├── AppError.ts         # Base para errores controlados
│   │   ├── ValidationError.ts  # Errores de validación (400)
│   │   └── ExternalServiceError.ts  # Errores de servicios externos (502)
│   ├── validations/            # Validadores por dominio
│   ├── typings/                # Interfaces TypeScript por dominio
│   │   ├── context.ts          # Context y State tipados
│   │   ├── settings.ts         # AppSettings
│   │   └── tracking.ts         # Tipos de dominio Tracking
│   ├── config/
│   │   ├── constants.ts
│   │   └── timeouts.ts
│   └── utils/
│       ├── logger.ts           # Logger estructurado (JSON)
│       └── response.ts         # Builders de respuesta estándar
├── messages/                   # i18n (requerido por el builder messages)
│   ├── en.json
│   └── es.json
└── manifest.json
```

---

## Arquitectura

El proyecto sigue una separación estricta por capas:

```
Route / Resolver  →  Service  →  Client
       ↑                              ↑
  (transport)      (dominio)    (infraestructura)
```

- **Routes / Resolvers**: solo coordinan, no tienen lógica de negocio.
- **Services**: orquestan la lógica. Son agnósticos al transport (REST o GraphQL pueden compartir el mismo service).
- **Clients**: encapsulan comunicación con APIs externas o internas.

---

## Cómo agregar una ruta REST

**1. Crear el handler en `node/routes/`:**

```typescript
// node/routes/myRoute.ts
import type { Context } from '../typings/context'

export async function myRoute(ctx: Context) {
  ctx.status = 200
  ctx.body = { ok: true }
}
```

**2. Declarar la ruta en `node/service.json`:**

```json
{
  "routes": {
    "myRoute": {
      "path": "/_v/private/my-route",
      "public": false
    }
  }
}
```

> El nombre de la clave (`myRoute`) debe coincidir exactamente con el nombre en `service.ts`. Los path params se declaran como `:param`.

**3. Registrar el handler en `node/service.ts`:**

```typescript
import { myRoute } from './routes/myRoute'

routes: {
  myRoute: method({
    GET: [errorHandler, requestLogger, myRoute],
  }),
}
```

---

## ⚠️ Rutas públicas vs privadas — decisión crítica

Esta es la decisión más importante al declarar una ruta. Elegir mal expone datos o rompe integraciones.

### Ruta privada (default — usar siempre salvo excepción)

```json
{
  "path": "/_v/private/my-route",
  "public": false
}
```

- Solo accesible desde otras apps VTEX IO o llamadas autenticadas con token de VTEX.
- **Usar para**: lógica interna, integraciones entre apps, datos sensibles, OMS, pricing, inventario.

### Ruta pública

```json
{
  "path": "/_v/public/my-route",
  "public": true
}
```

- Accesible desde el browser del cliente final sin autenticación.
- **Usar para**: healthcheck, endpoints de storefront, datos no sensibles que consume el frontend.
- **NUNCA exponer** datos de órdenes, clientes, precios especiales, o lógica de negocio crítica en rutas públicas.

### Regla práctica

| ¿Quién llama la ruta? | Visibilidad |
|---|---|
| Otra app VTEX IO / backend | `private` |
| Frontend / storefront / browser | `public` |
| Monitoring / healthcheck externo | `public` |
| Cualquier cosa que toque datos de negocio | `private` |

> **El path debe reflejar la visibilidad**: `/_v/private/...` para privadas, `/_v/public/...` para públicas. Es convención del framework y ayuda a auditar de un vistazo.

---

## Cómo agregar una query GraphQL

**1. Declarar el tipo y query en `graphql/`:**

```graphql
# graphql/types/myDomain.graphql
type MyResponse {
  id: String!
  name: String!
}
```

```graphql
# graphql/schema.graphql
type Query {
  myQuery(id: String!): MyResponse! @auth(scope: PUBLIC)
}
```

**2. Crear el resolver en `node/resolvers/queries/`:**

```typescript
// node/resolvers/queries/myQuery.ts
import type { Context } from '../../typings/context'

export async function myQuery(_: unknown, args: { id: string }, ctx: Context) {
  // usar ctx.clients o llamar a un service
  return { id: args.id, name: 'Example' }
}
```

**3. Registrar en `node/resolvers/queries/index.ts`:**

```typescript
import { myQuery } from './myQuery'

export default {
  myQuery,
}
```

---

## ⚠️ GraphQL — visibilidad por query — decisión crítica

En GraphQL la visibilidad **no se controla en `service.json`** sino con la directiva `@auth` en cada query o mutation del schema. Cada operación tiene su propio scope.

### Scopes disponibles

```graphql
# Cualquiera puede llamarla — sin autenticación
type Query {
  myQuery(id: String!): MyResponse! @auth(scope: PUBLIC)
}

# Solo usuarios logueados (sesión VTEX activa)
type Query {
  myQuery(id: String!): MyResponse! @auth(scope: PRIVATE)
}

# Solo administradores del panel VTEX
type Query {
  myQuery(id: String!): MyResponse! @auth(scope: ADMIN)
}
```

### Regla práctica

| ¿Quién llama la query? | Scope |
|---|---|
| Storefront / browser sin login | `PUBLIC` |
| Storefront con usuario logueado | `PRIVATE` |
| Panel admin / integración interna | `ADMIN` |
| Cualquier cosa que toque datos sensibles | `ADMIN` o `PRIVATE` |

> **NUNCA declarar `PUBLIC` en queries que devuelvan datos de órdenes, clientes, precios especiales o inventario**. El endpoint `/_v/graphql` es accesible desde internet — el `@auth` es la única barrera.

### Diferencia con rutas REST

| | REST | GraphQL |
|---|---|---|
| Visibilidad | `public: true/false` en `service.json` | `@auth(scope: ...)` en el schema |
| Granularidad | Por ruta completa | Por query / mutation individual |
| Path | `/_v/public/...` o `/_v/private/...` | Siempre `/_v/graphql` |

---

## Cómo agregar un client

**1. Crear el client en `node/clients/`:**

```typescript
// node/clients/myApi.ts
import { ExternalClient, IOContext, InstanceOptions } from '@vtex/api'

export default class MyApiClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://localhost', context, options)
  }

  public getData(baseUrl: string, id: string) {
    return this.http.get(`${baseUrl}/resource/${id}`)
  }
}
```

> La URL base se recibe por parámetro del método para que pueda venir de `AppSettings`, no hardcodeada.

**2. Registrar en `node/clients.ts`:**

```typescript
import MyApiClient from './clients/myApi'

public get myApi() {
  return this.getOrSet('myApi', MyApiClient)
}
```

**3. Si el client accede a APIs internas de VTEX, agregar la policy en `manifest.json`:**

```json
"policies": [
  {
    "name": "outbound-access",
    "attrs": {
      "host": "portal.vtexcommercestable.com.br",
      "path": "/api/my-endpoint/*"
    }
  }
]
```

---

## Configuración de la app (Settings)

Los settings se declaran en `manifest.json` bajo `settingsSchema` y se leen con `getAppSettings`:

```typescript
const settings = await getAppSettings(ctx)
// settings.externalApiBaseUrl
// settings.externalApiToken
```

Para agregar un nuevo setting:
1. Declararlo en `manifest.json > settingsSchema > properties`
2. Agregarlo a `node/typings/settings.ts > AppSettings`

---

## Manejo de errores

Usar las clases de error provistas para que `errorHandler` responda con el código HTTP correcto:

```typescript
import { ValidationError } from '../errors/ValidationError'
import { ExternalServiceError } from '../errors/ExternalServiceError'

// 400
throw new ValidationError('El orderId es requerido')

// 502
throw new ExternalServiceError('Error en carrier externo', originalError)
```

Errores no capturados devuelven 500 automáticamente.

---

## Deploy

```bash
# Linkear en workspace de desarrollo
vtex link

# Deploy a producción
vtex deploy

# Publicar nueva versión
vtex publish
```

---

## Requisitos

- Node.js 16+
- VTEX CLI: `npm i -g vtex`
- Cuenta VTEX con workspace de desarrollo
