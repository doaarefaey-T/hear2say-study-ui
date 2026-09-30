import { supabase } from "./supabase";

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
if (!baseUrl) throw new Error("Supabase Edge Function URL is missing.");
export const apiUrl = (path: string) => `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

export class ApiError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}

export async function api<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (authenticated) {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) throw new ApiError(401, "SIGN_IN_REQUIRED");
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
  }
  const response = await fetch(apiUrl(path), { ...init, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: unknown };
    throw new ApiError(response.status, typeof payload.error === "string" ? payload.error : "REQUEST_FAILED");
  }
  return response.json() as Promise<T>;
}

export async function protectedDownload(slug: string, filename: string): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) throw new ApiError(401, "SIGN_IN_REQUIRED");
  const popup = window.open("about:blank", "_blank", "noopener");
  const response = await fetch(apiUrl(`/content/${encodeURIComponent(slug)}`), { headers: { Authorization: `Bearer ${data.session.access_token}` } });
  if (!response.ok) { popup?.close(); const data = await response.json().catch(() => ({})) as { error?: unknown }; throw new ApiError(response.status, typeof data.error === "string" ? data.error : "CONTENT_UNAVAILABLE"); }
  const link = await response.json() as { signed_url: string; expires_in_seconds: number; filename: string };
  if (!link.signed_url || link.expires_in_seconds > 60) { popup?.close(); throw new ApiError(500, "CONTENT_LINK_UNAVAILABLE"); }
  if (popup) popup.location.replace(link.signed_url); else window.location.assign(link.signed_url);
}
