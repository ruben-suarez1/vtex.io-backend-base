# VTEX IO Backend Base

## Propósito

Este boilerplate es la base de arranque para cualquier desarrollo backend en VTEX IO dentro de Asylum Marketing.

Resuelve de entrada los problemas que aparecen en todo proyecto real:
- Estructura de carpetas por dominio, escalable sin volverse caótica
- Separación estricta de capas: transport → dominio → infraestructura *(transport = REST routes + GraphQL resolvers)*
- Middlewares de trazabilidad, logging y manejo de errores ya configurados
- Soporte para REST y GraphQL desde el mismo app
- Clients tipados para APIs de VTEX y servicios externos
- Cache por ruta con estrategia definida

Cualquier nuevo dominio (tracking, inventory, pricing, etc.) sigue el mismo patrón. Si el segundo dominio entra limpio, la base está bien diseñada.

---

## Reglas no negociables

Estas reglas no son sugerencias. Son el estándar del boilerplate y se aplican a todos los dominios, sin excepción.

| Regla | Por qué |
|---|---|
| **No poner lógica de negocio en routes** | Las routes solo coordinan: extraen params, llaman al service, setean cache y body. Nada más. |
| **No poner lógica de negocio en resolvers** | Los resolvers son el equivalente GraphQL de las routes: delegan al service, no procesan. |
| **No poner lógica de negocio en clients** | Los clients encapsulan comunicación HTTP, no decisiones de negocio. |
| **Todo input de negocio se valida al inicio del service** | Las routes/resolvers solo extraen y convierten params básicos (`String(...)`, `?? ''`). La validación real — formato, existencia, reglas — es responsabilidad del service. |
| **Toda integración externa debe considerar timeout** | Sin timeout, un servicio externo caído cuelga la request indefinidamente. Usar `withTimeout`. |
| **Todo dominio nuevo debe traer tests mínimos** | Validación, normalizador y service con mocks. Sin tests, el dominio no está terminado. |
| **Toda ruta pública debe justificar por qué es pública** | El default es privado. Lo público es una excepción que requiere decisión consciente. |

---

## Requisitos

- Node.js 16+
- VTEX CLI instalado globalmente: `npm i -g vtex`
- Cuenta VTEX con workspace de desarrollo disponible

---

## Cómo hacer vtex link

```bash
# 1. Autenticarse con la cuenta VTEX
vtex login asylummarketing

# 2. Crear o usar un workspace de desarrollo
vtex use {nombre-workspace}

# 3. Linkear el app (hot reload automático al guardar)
vtex link
```

Cuando el link está activo, la consola muestra las rutas disponibles:

```
Available service routes:
https://app.io.vtex.com/asylummarketing.vtex-io-backend-base/v0/asylummarketing/{workspace}/_v/graphql
https://{workspace}--asylummarketing.myvtex.com/_v/public/healthcheck
https://{workspace}--asylummarketing.myvtex.com/_v/public/tracking/:orderId
https://{workspace}--asylummarketing.myvtex.com/_v/public/inventory/:skuId
https://{workspace}--asylummarketing.myvtex.com/_v/public/availability/:skuId
```

---

## Cómo probar localmente

### Rutas REST

Usar Postman, Insomnia o curl directamente:

```bash
# Healthcheck
curl https://{workspace}--asylummarketing.myvtex.com/_v/public/healthcheck

# Tracking
curl https://{workspace}--asylummarketing.myvtex.com/_v/public/tracking/1626210500001-01

# Inventory
curl https://{workspace}--asylummarketing.myvtex.com/_v/public/inventory/5103261

# Availability by seller
curl https://{workspace}--asylummarketing.myvtex.com/_v/public/availability/5103261

# Availability filtrada por seller
curl https://{workspace}--asylummarketing.myvtex.com/_v/public/availability/5103261?sellerId=vtxkn1
```

> Las rutas públicas son cacheadas por el CDN de VTEX. Si no ves cambios, agregá un query param para romper el cache: `?v=1`, `?v=2`, etc.

### GraphQL

El endpoint GraphQL requiere autenticación incluso en desarrollo. Obtené el token:

```bash
vtex local token
```

Luego usá ese token en Postman o cualquier cliente GraphQL:

```
POST https://app.io.vtex.com/asylummarketing.vtex-io-backend-base/v0/asylummarketing/{workspace}/_v/graphql

Headers:
  Authorization: bearer {token}
  Content-Type: application/json
```

Ejemplo de query:

```graphql
query {
  inventory(skuId: "5103261") {
    skuId
    skuName
    totalAvailable
    warehouses {
      warehouseId
      availableQuantity
    }
  }
}
```

### Logs en tiempo real

Todos los logs aparecen en la terminal donde corre `vtex link`. Cada request loguea:
- `requestId` único para trazabilidad
- Método, path, params y query
- Status y duración en ms al finalizar

---

## Tests

Los tests viven en `__tests__/` en la raíz del proyecto — fuera de `node/` para que el builder de VTEX IO no los incluya en el build.

```
__tests__/
├── validations/
│   ├── tracking.test.ts
│   ├── inventory.test.ts
│   └── availability.test.ts
└── services/
    ├── tracking/
    │   ├── normalizeTracking.test.ts
    │   └── getTrackingData.test.ts
    ├── inventory/
    │   ├── normalizeInventory.test.ts
    │   └── getInventoryByChannel.test.ts
    └── availability/
        ├── normalizeAvailability.test.ts
        └── getAvailabilityBySeller.test.ts
```

### Correr los tests

```bash
cd node
yarn test              # corre todos los tests
yarn test:coverage     # corre con reporte de cobertura
```

### Qué se testea

| Archivo | Qué cubre |
|---|---|
| `validations/tracking.test.ts` | `validateOrderId` — vacío, muy corto, válido |
| `validations/inventory.test.ts` | `validateSkuId` — vacío, espacios, válido |
| `validations/availability.test.ts` | `validateSkuId` — vacío, espacios, válido |
| `services/tracking/normalizeTracking.test.ts` | null, objeto único, array, defaults, coerción de tipos |
| `services/tracking/getTrackingData.test.ts` | flujo completo con OMS y carrier mockeados |
| `services/inventory/normalizeInventory.test.ts` | balance vacío, filtro por channel, cálculo available, coerción de tipos |
| `services/inventory/getInventoryByChannel.test.ts` | flujo completo con inventory y catalog mockeados |
| `services/availability/normalizeAvailability.test.ts` | balance vacío, sellers activos, suma total, filtro, negativos |
| `services/availability/getAvailabilityBySeller.test.ts` | flujo completo con inventory, seller y catalog mockeados |

### Regla para nuevos dominios

Cada dominio nuevo debe tener al menos:
1. Test de su validación
2. Test de su normalizador
3. Test de su service con mocks de clients

```typescript
// Patrón de mock de Context para tests de services
function createCtx(overrides = {}) {
  return {
    clients: {
      apps: { getAppSettings: jest.fn().mockResolvedValue(mockSettings) },
      miClient: { miMetodo: jest.fn() },
      ...overrides,
    },
  } as any
}
```

> **`vtex link` no se ve afectado por los tests** — al estar fuera de `node/`, el builder remoto no los procesa.

---

## Estructura de carpetas

```
.
├── __tests__/                          # Tests unitarios — fuera de node/ a propósito
│   ├── validations/
│   └── services/
├── graphql/
│   ├── schema.graphql              # Entry point: declara todas las queries y mutations
│   └── types/                      # Un archivo .graphql por dominio
│       ├── common.graphql
│       ├── tracking.graphql
│       ├── inventory.graphql
│       └── availability.graphql
├── node/
│   ├── index.ts                    # Entry point: exporta service (REST) y resolvers (GraphQL)
│   ├── service.ts                  # Registra rutas REST con su cadena de middlewares
│   ├── service.json                # Declara paths y visibilidad de cada ruta REST
│   ├── clients.ts                  # Registro centralizado de todos los clients
│   ├── clients/
│   │   ├── index.ts                # Re-exporta todos los clients
│   │   ├── oms.ts                  # Client para OMS de VTEX
│   │   ├── catalog.ts              # Client para Catalog de VTEX
│   │   ├── inventory.ts            # Client para Logistics/Inventory de VTEX
│   │   ├── seller.ts               # Client para Seller Register de VTEX
│   │   └── externalCarrier.ts      # Client para API externa de carrier
│   ├── resolvers/
│   │   ├── index.ts                # Agrupa queries y mutations
│   │   ├── queries/
│   │   │   ├── index.ts            # Registra todos los query resolvers
│   │   │   ├── tracking.ts
│   │   │   ├── inventory.ts
│   │   │   └── availability.ts
│   │   └── mutations/
│   │       └── index.ts
│   ├── routes/                     # Routes REST — cada archivo exporta un handler, sin lógica de negocio
│   │   ├── healthcheck.ts
│   │   ├── tracking.ts
│   │   ├── inventory.ts
│   │   └── availability.ts
│   ├── services/                   # Lógica de negocio — agnóstica al transport
│   │   ├── settings/
│   │   │   └── getAppSettings.ts
│   │   ├── tracking/
│   │   │   ├── getTrackingData.ts
│   │   │   └── normalizeTracking.ts
│   │   ├── inventory/
│   │   │   ├── getInventoryByChannel.ts
│   │   │   └── normalizeInventory.ts
│   │   └── availability/
│   │       ├── getAvailabilityBySeller.ts
│   │       └── normalizeAvailability.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts         # Captura AppError y errores no controlados
│   │   ├── requestLogger.ts        # Log de entrada/salida con requestId
│   │   ├── requestId.ts            # Genera y propaga X-Request-Id
│   │   └── responseTime.ts         # Agrega header X-Response-Time
│   ├── errors/
│   │   ├── AppError.ts             # Base para todos los errores controlados
│   │   ├── ValidationError.ts      # 400 — input inválido
│   │   └── ExternalServiceError.ts # 502 — fallo de servicio externo
│   ├── validations/                # Un archivo por dominio
│   │   ├── tracking.ts
│   │   ├── inventory.ts
│   │   └── availability.ts
│   ├── typings/                    # Interfaces TypeScript por dominio
│   │   ├── context.ts              # Context y State tipados
│   │   ├── settings.ts             # AppSettings
│   │   ├── tracking.ts
│   │   ├── inventory.ts
│   │   └── availability.ts
│   ├── config/
│   │   ├── constants.ts
│   │   └── timeouts.ts
│   └── utils/
│       ├── logger.ts               # Logger estructurado en JSON
│       ├── response.ts             # ApiSuccessResponse<T>, ApiErrorResponse, buildErrorResponse, buildSuccessResponse, setCache
│       ├── withRetry.ts            # Reintentos con backoff exponencial
│       └── withTimeout.ts          # Timeout configurable por llamada
├── messages/
│   ├── en.json
│   └── es.json
└── manifest.json
```

---

## Flujo de una request

Cada request REST pasa por la siguiente cadena antes de llegar al handler:

```
Request entrante
      │
      ▼
 errorHandler       ← envuelve todo, captura cualquier error
      │
      ▼
  requestId         ← genera X-Request-Id único (o propaga el entrante)
      │
      ▼
 responseTime       ← inicia el timer para X-Response-Time
      │
      ▼
requestLogger       ← loguea entrada con requestId, método, path, params
      │
      ▼
 route handler      ← extrae params, llama al service, setea cache y body
      │
      ▼
   service          ← valida, orquesta clients, normaliza
      │
      ▼
   client(s)        ← llama APIs externas o internas de VTEX
      │
      ▼
requestLogger       ← loguea salida con status y durationMs
      │
      ▼
 responseTime       ← escribe header X-Response-Time
      │
      ▼
  Respuesta HTTP
```

Para GraphQL el flujo es el mismo desde el resolver en adelante — routes y resolvers comparten los mismos services.

### Flujo cuando algo falla

Cualquier error lanzado dentro del service o el client es capturado por `errorHandler`, que está primero en la cadena.

```
Request entrante
      │
      ▼
 errorHandler       ← envuelve todo con try/catch
      │
      ▼
  ... middlewares ...
      │
      ▼
 route handler
      │
      ▼
   service          ← orquesta la lógica
      │
      ▼
   client           ← llama API externa → falla (timeout, 5xx, red)
      │
      ▼  lanza ExternalServiceError("Error en carrier", error)
   service          ← no captura — deja que suba
      │
      ▼
 errorHandler       ← captura, lee statusCode y code del AppError
      │
      ▼
  HTTP 502 + body:
  {
    "success": false,
    "code": "EXTERNAL_SERVICE_ERROR",
    "message": "Error en carrier",
    "details": null
  }
```

Las clases de error mapean directamente al código HTTP:

| Error lanzado | HTTP | `code` |
|---|---|---|
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| `AppError` (custom) | el que definas | el que definas |
| `ExternalServiceError` | 502 | `EXTERNAL_SERVICE_ERROR` |
| cualquier otro `Error` | 500 | `INTERNAL_SERVER_ERROR` |

> El service **nunca captura** los errores para transformarlos en respuestas HTTP — eso es responsabilidad exclusiva de `errorHandler`. El service solo lanza.

---

## Checklist para agregar un nuevo dominio

Cada ítem con `*` es opcional según el dominio. El resto es obligatorio.

- [ ] Crear `node/typings/{dominio}.ts` — interfaces del dominio
- [ ] Crear `node/validations/{dominio}.ts` — validación de inputs de negocio
- [ ] Crear `node/clients/{dominio}.ts` — client HTTP si el dominio integra una API nueva `*`
- [ ] Registrar el client en `node/clients.ts` y `node/clients/index.ts` `*`
- [ ] Crear `node/services/{dominio}/get{Dominio}.ts` — orquestación y lógica
- [ ] Crear `node/services/{dominio}/normalize{Dominio}.ts` — normalización del raw
- [ ] Crear `node/routes/{dominio}.ts` — route REST con su handler `*`
- [ ] Registrar la route en `node/service.ts` y `node/service.json` `*`
- [ ] Crear `node/resolvers/queries/{dominio}.ts` — resolver GraphQL `*`
- [ ] Registrar el resolver en `node/resolvers/queries/index.ts` `*`
- [ ] Declarar el tipo en `graphql/types/{dominio}.graphql` y la query en `graphql/schema.graphql` `*`
- [ ] Agregar tests: validación, normalizer y service con mocks
- [ ] Definir TTL de cache en la route (`setCache(ctx, N)`)
- [ ] Justificar visibilidad pública en `service.json` o scope en GraphQL si aplica

---

## Cómo crear un nuevo client

Un client encapsula toda la comunicación con una API externa o interna de VTEX.

**1. Crear el archivo en `node/clients/`:**

```typescript
// node/clients/pricing.ts
import { ExternalClient, IOContext, InstanceOptions } from '@vtex/api'

export default class PricingClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`https://${context.account}.vtexcommercestable.com.br`, context, options)
  }

  public getPrice(skuId: string, appKey: string, appToken: string) {
    return this.http.get(`/api/pricing/prices/${skuId}`, {
      headers: {
        'X-VTEX-API-AppKey': appKey,
        'X-VTEX-API-AppToken': appToken,
      },
    })
  }
}
```

**2. Registrar en `node/clients.ts`:**

```typescript
import PricingClient from './clients/pricing'

public get pricing() {
  return this.getOrSet('pricing', PricingClient)
}
```

**3. Re-exportar en `node/clients/index.ts`:**

```typescript
export { default as PricingClient } from './pricing'
```

**4. Agregar la policy en `manifest.json`:**

```json
{
  "name": "outbound-access",
  "attrs": {
    "host": "*.vtexcommercestable.com.br",
    "path": "/api/pricing/prices/*"
  }
}
```

> La URL base se construye en el constructor usando `context.account` para que sea dinámica por cuenta. Nunca hardcodear URLs de VTEX.

---

## Cómo crear un nuevo service

Un service contiene la lógica de negocio. Es agnóstico al transport — puede ser llamado desde una route REST y desde un resolver GraphQL.

**1. Crear la carpeta del dominio en `node/services/`:**

```typescript
// node/services/pricing/getPriceBySkuId.ts
import type { Context } from '../../typings/context'
import { validateSkuId } from '../../validations/pricing'
import { getAppSettings } from '../settings/getAppSettings'

export async function getPriceBySkuId(skuId: string, ctx: Context) {
  validateSkuId(skuId)

  const settings = await getAppSettings(ctx)
  const appKey = settings.omsAppKey ?? ''
  const appToken = settings.omsAppToken ?? ''

  const raw = await ctx.clients.pricing.getPrice(skuId, appKey, appToken)

  return {
    skuId,
    price: raw.costPrice,
    currency: raw.currency,
  }
}
```

**Reglas del service:**
- Siempre validar inputs al inicio
- Nunca acceder a `ctx.body`, `ctx.status` ni `ctx.query` — eso es del transport
- Llamadas paralelas con `Promise.all` cuando no hay dependencia entre ellas
- Usar `withRetry` para servicios inestables, `withTimeout` para límites duros

---

## Cómo crear una nueva route REST

Una route solo coordina: extrae params, llama al service, setea cache y body.

**1. Crear el handler en `node/routes/`:**

```typescript
// node/routes/pricing.ts
import type { Context } from '../typings/context'
import { getPriceBySkuId } from '../services/pricing/getPriceBySkuId'
import { setCache } from '../utils/response'

export async function pricingRoute(ctx: Context) {
  const skuId = String(ctx.vtex.route.params.skuId ?? '')

  const result = await getPriceBySkuId(skuId, ctx)

  setCache(ctx, 30)
  ctx.status = 200
  ctx.body = result
}
```

**2. Declarar la ruta en `node/service.json`:**

```json
{
  "routes": {
    "pricing": {
      "path": "/_v/public/pricing/:skuId",
      "public": true
    }
  }
}
```

> El nombre de la clave debe coincidir exactamente con el nombre en `service.ts`.

**3. Registrar en `node/service.ts`:**

```typescript
import { pricingRoute } from './routes/pricing'

routes: {
  pricing: method({
    GET: [errorHandler, requestId, responseTime, requestLogger, pricingRoute],
  }),
}
```

---

## ⚠️ Rutas públicas vs privadas — decisión crítica

| ¿Quién llama la ruta? | Visibilidad | Path |
|---|---|---|
| Frontend / storefront / browser | `public: true` | `/_v/public/...` |
| Monitoring / healthcheck externo | `public: true` | `/_v/public/...` |
| Otra app VTEX IO / backend | `public: false` | `/_v/private/...` |
| Cualquier cosa que toque datos de negocio | `public: false` | `/_v/private/...` |

> **OJO** No exponer en rutas públicas datos sensibles de órdenes, clientes, precios especiales o inventario detallado por warehouse cuando implique riesgo de negocio.

---

## Cómo crear un nuevo resolver GraphQL

Un resolver GraphQL llama al mismo service que la route REST del mismo dominio.

**1. Declarar el tipo en `graphql/types/`:**

```graphql
# graphql/types/pricing.graphql
type PriceResponse {
  skuId: String!
  price: Float!
  currency: String!
}
```

**2. Agregar la query en `graphql/schema.graphql`:**

```graphql
type Query {
  price(skuId: String!): PriceResponse! @auth(scope: PUBLIC)
}
```

> **OJO** PUBLIC es solo un ejemplo. Para datos de pricing, stock detallado, órdenes o datos sensibles, evaluar PRIVATE o ADMIN.

**3. Crear el resolver en `node/resolvers/queries/`:**

```typescript
// node/resolvers/queries/price.ts
import type { Context } from '../../typings/context'
import { getPriceBySkuId } from '../../services/pricing/getPriceBySkuId'

export async function price(_: unknown, args: { skuId: string }, ctx: Context) {
  return getPriceBySkuId(args.skuId, ctx)
}
```

**4. Registrar en `node/resolvers/queries/index.ts`:**

```typescript
import { price } from './price'

export default {
  price,
}
```

---

## ⚠️ GraphQL — visibilidad por query — decisión crítica

| ¿Quién llama la query? | Scope |
|---|---|
| Storefront / browser sin login | `PUBLIC` |
| Storefront con usuario logueado | `PRIVATE` |
| Panel admin / integración interna | `ADMIN` |
| Cualquier cosa que toque datos sensibles | `ADMIN` o `PRIVATE` |

> **El endpoint `/_v/graphql` es accesible desde internet.** El `@auth` es la única barrera — usarlo siempre y elegir el scope correcto.

---

## Cómo registrar una ruta en service.json

`service.json` y `service.ts` trabajan juntos. El nombre de la clave debe ser idéntico en ambos.

```json
{
  "memory": 256,
  "ttl": 10,
  "timeout": 10,
  "minReplicas": 2,
  "maxReplicas": 10,
  "workers": 4,
  "routes": {
    "nombreRuta": {
      "path": "/_v/public/mi-ruta/:param",
      "public": true
    }
  }
}
```

| Campo | Descripción |
|---|---|
| `memory` | MB asignados por instancia |
| `ttl` | Minutos sin requests antes de destruir la instancia |
| `minReplicas` | Instancias siempre activas (evita cold start) |
| `maxReplicas` | Límite de escala bajo carga |
| `path` | URL de la ruta. Params con `:nombre` |
| `public` | `true` = accesible sin auth. `false` = solo apps autenticadas |

---

## Manejo de errores

Usar las clases provistas para que `errorHandler` responda con el código HTTP correcto:

```typescript
import { ValidationError } from '../errors/ValidationError'
import { ExternalServiceError } from '../errors/ExternalServiceError'

throw new ValidationError('skuId es requerido')           // → 400
throw new ExternalServiceError('Error en carrier', error) // → 502
```

Errores no capturados devuelven 500 automáticamente.

---

## Contrato estándar de respuesta

Todos los endpoints de este boilerplate responden con uno de dos shapes. Los tipos están exportados desde `node/utils/response.ts`.

### Error

Cualquier error controlado o no controlado produce siempre este shape:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "skuId es requerido",
  "details": null
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `success` | `false` | Siempre `false` en errores |
| `code` | `string` | Identificador del error — `VALIDATION_ERROR`, `EXTERNAL_SERVICE_ERROR`, `INTERNAL_SERVER_ERROR` |
| `message` | `string` | Mensaje legible para el consumidor |
| `details` | `unknown \| null` | Información adicional opcional. `null` si no aplica |

> **`details` nunca debe contener** tokens, credenciales, API keys, payloads de servicios externos ni datos personales. Es un campo público — cualquier consumidor de la API lo puede leer.

### Éxito

Los dominios de este boilerplate devuelven el shape del dominio directamente, sin envoltura `data`. Cada dominio define su propio contrato de éxito tipado en `node/typings/`.

```json
{
  "skuId": "5103261",
  "skuName": "Remera Lisa Blanca",
  "sellers": [...]
}
```

Si necesitás una envoltura genérica de éxito, `buildSuccessResponse<T>(data)` está disponible y retorna `{ success: true, data: T }`. Usala cuando el contexto lo requiera.

> `success: false` como discriminador es suficiente para que cualquier cliente detecte el caso de error sin parsear el código HTTP.

---

## Utilidades disponibles

```typescript
import { withRetry } from '../utils/withRetry'
import { withTimeout } from '../utils/withTimeout'
import { setCache } from '../utils/response'

// Reintentos con backoff exponencial (300ms, 600ms, 900ms)
const data = await withRetry(() => ctx.clients.carrier.getTracking(...), 3)

// Timeout duro — lanza AppError 504 si supera el límite
const data = await withTimeout(ctx.clients.oms.getOrder(...), 5000)

// Cache en la respuesta HTTP
setCache(ctx, 60)  // 60 segundos. setCache(ctx, 0) = no-store
```

### Estrategia de cache por tipo de endpoint

El CDN de VTEX cachea las respuestas públicas según el header `Cache-Control` que seteás. Elegir mal el TTL tiene consecuencias reales: demasiado alto y los datos quedan desactualizados, demasiado bajo y cada request va al origin.

| Tipo de endpoint | TTL sugerido | Motivo |
|---|---|---|
| Healthcheck | `0` (no-store) | Debe reflejar el estado real en tiempo real |
| Tracking / estado de orden | `0` o muy bajo (≤ 10 s) | Dato mutable que el usuario espera ver actualizado |
| Inventory agregado | `30`–`60` s | Cambia con frecuencia pero tolera algo de lag |
| Pricing sensible / precios especiales | `0` (no-store) | Riesgo de negocio si un precio incorrecto queda cacheado |
| Catálogos / datos de solo lectura | `60`–`300` s | Dato estable, alto beneficio de cachear |

> **Romper el cache manualmente**: el CDN cachea por URL. Si necesitás forzar un refresh en desarrollo, agregá un query param: `?v=2`, `?v=3`, etc.

---

## Configuración de la app (Settings)

Los settings se configuran desde **VTEX Admin → Apps → {app} → Settings**.

Se leen en el código con:

```typescript
const settings = await getAppSettings(ctx)
```

Para agregar un nuevo setting:
1. Declararlo en `manifest.json > settingsSchema > properties`
2. Agregarlo a `node/typings/settings.ts > AppSettings`

---

## Versionado

La versión vive en `manifest.json`. Seguimos semver:

| Cambio | Bump |
|---|---|
| Cambio estructural mayor — renombrar capas, romper contratos de response, cambiar convención de carpetas | `major` |
| Nuevo dominio compatible, nuevo client, nueva ruta o query GraphQL | `minor` |
| Fix de bug, mejora de performance, tests, documentación | `patch` |

```bash
# Ejemplo en manifest.json
"version": "1.2.0"
```

> VTEX IO requiere publicar cada versión antes de deployar (`vtex publish` → `vtex deploy`). Un bump incorrecto puede romper apps que dependen de esta versión.

---

## Deploy

```bash
# Publicar nueva versión
vtex publish

# Deployar a producción
vtex deploy
```
