import type { Context } from '../../typings/context'
import type { AppSettings } from '../../typings/settings'

export async function getAppSettings(ctx: Context): Promise<AppSettings> {
  const settings = await ctx.clients.apps.getAppSettings(process.env.VTEX_APP_ID ?? '')

  return {
    externalApiBaseUrl: settings.externalApiBaseUrl,
    externalApiToken: settings.externalApiToken,
    omsAppKey: settings.omsAppKey,
    omsAppToken: settings.omsAppToken,
  }
}