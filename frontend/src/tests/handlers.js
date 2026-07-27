import { http, HttpResponse } from 'msw'

// Success responses for every backend endpoint the frontend calls. Shapes match
// app.schemas.SuccessResponse. Per-test error cases override these with
// `server.use(...)` — see the helpers below.

export const handlers = [
  http.post('*/api/quotes/', () =>
    HttpResponse.json(
      { success: true, message: "Quote request submitted successfully. We'll be in touch within 24 hours.", id: 1 },
      { status: 200 },
    ),
  ),
  http.post('*/api/contact/', () =>
    HttpResponse.json(
      { success: true, message: "Message received. We'll get back to you shortly.", id: 1 },
      { status: 200 },
    ),
  ),
]

/** FastAPI-shaped 422 with a `detail` array, for one endpoint. */
export function validationError(endpoint, detail) {
  return http.post(`*${endpoint}`, () => HttpResponse.json({ detail }, { status: 422 }))
}

/** A plain string-detail error at an arbitrary status (e.g. 429). */
export function stringError(endpoint, status, detail) {
  return http.post(`*${endpoint}`, () => HttpResponse.json({ detail }, { status }))
}

/** A 500 with no useful body. */
export function serverError(endpoint) {
  return http.post(`*${endpoint}`, () => HttpResponse.json({}, { status: 500 }))
}

/** A transport-level failure — fetch itself rejects. */
export function networkError(endpoint) {
  return http.post(`*${endpoint}`, () => HttpResponse.error())
}
