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

/** Human-readable names for the API field names that can appear in a 422. */
const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  company: "Company",
  phone: "Phone",
  products: "Sector",
  volume: "Volume",
  frequency: "Frequency",
  destination: "Destination",
  message: "Your requirement",
  subject: "Subject",
};

/**
 * Turn FastAPI's 422 body into a sentence.
 *
 * FastAPI reports validation failures as `detail: [{ loc, msg, type }, ...]` —
 * an array, not a string. Passing that straight to `new Error()` stringifies it
 * to "[object Object]", which is what the user used to see for any server-side
 * validation failure.
 */
function formatValidationErrors(detail) {
  const messages = detail
    .map((item) => {
      // `loc` is ["body", "<field>", ...]; for a list field it carries an index
      // too, e.g. ["body", "products", 0].
      const path = Array.isArray(item.loc) ? item.loc.filter((p) => p !== "body") : [];
      const field = typeof path[0] === "string" ? path[0] : null;
      // Pydantic prefixes messages raised by custom validators with
      // "Value error, "; it is noise to a form user.
      const msg = String(item.msg || "is invalid").replace(/^Value error,\s*/, "");
      const label = field ? FIELD_LABELS[field] ?? field : null;
      return label ? `${label}: ${msg}` : msg;
    })
    .filter(Boolean);

  return messages.length ? messages.join(" ") : null;
}

/** Best-effort readable message from an error response body. */
function errorMessage(data) {
  const { detail } = data ?? {};

  if (Array.isArray(detail)) {
    return formatValidationErrors(detail) ?? "Submission failed. Please try again.";
  }
  if (typeof detail === "string" && detail) {
    return detail;
  }
  return "Submission failed. Please try again.";
}

/**
 * POST a JSON body and return the parsed JSON response.
 * Throws an Error carrying a readable message derived from the backend's
 * `detail`, in whichever shape the backend used.
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
    const error = new Error(errorMessage(data));
    error.status = res.status;
    throw error;
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
