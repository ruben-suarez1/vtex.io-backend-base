import type { TrackingGuide } from '../../typings/tracking'

export function normalizeTracking(rawData: any): TrackingGuide[] {
  if (!rawData) {
    return []
  }

  if (Array.isArray(rawData)) {
    return rawData.map((item) => ({
      trackingNumber: String(item.trackingNumber ?? ''),
      status: String(item.status ?? 'Unknown'),
      date: item.date ? String(item.date) : undefined,
    }))
  }

  return [
    {
      trackingNumber: String(rawData.trackingNumber ?? ''),
      status: String(rawData.status ?? 'Unknown'),
      date: rawData.date ? String(rawData.date) : undefined,
    },
  ]
}