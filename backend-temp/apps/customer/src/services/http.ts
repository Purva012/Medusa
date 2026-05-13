import { apiBaseUrl } from "../config/endpoints"

function createHeaders() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY

  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey
  }

  return headers
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "GET",
    headers: createHeaders(),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}
