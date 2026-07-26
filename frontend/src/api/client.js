/**
 * Centralised API communication layer.
 *
 * All network calls to the backend go through here so that the base URL,
 * headers, and error handling live in one place instead of being repeated
 * (with subtle differences) inside components.
 */

// Requests are proxied to the backend by Vite in dev (see vite.config.js).
// In production, set VITE_API_BASE_URL to the deployed API origin.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * POST a JSON body and return the parsed JSON response.
 * Throws an Error whose message is the backend's `detail` (when present).
 */
async function postJson(path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Network / CORS failure — fetch itself rejected.
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Submission failed. Please try again.");
  }

  return res.json().catch(() => ({}));
}

/** Strip empty-string optional fields so they serialise as absent, not "". */
function omitBlank(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined),
  );
}

/**
 * Submit a quote request.
 * @param {object} payload - name, email, products[] required; rest optional.
 */
export function submitQuote(payload) {
  const { name, email, products, message, ...optional } = payload;
  return postJson("/api/quotes/", {
    name,
    email,
    products,
    message,
    ...omitBlank(optional),
  });
}

/**
 * Submit a contact message.
 * @param {object} payload - name, email, message required; company optional.
 */
export function submitContact(payload) {
  return postJson("/api/contact/", payload);
}
