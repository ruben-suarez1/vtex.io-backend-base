export interface TrackingArgs {
  orderId: string
}

export interface TrackingGuide {
  trackingNumber: string
  status: string
  date?: string
}

export interface TrackingResponse {
  success: boolean
  message: string
  guides: TrackingGuide[]
}