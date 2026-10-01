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

export async function privateAudioUrl(activityId: string): Promise<string> {
  const result = await api<{ signed_url: string; expires_in_seconds: number }>(`/learning/activities/${activityId}/audio`, {}, true);
  if (!result.signed_url || result.expires_in_seconds > 60) throw new ApiError(500, "AUDIO_LINK_UNAVAILABLE");
  return result.signed_url;
}

export async function couponAdmin<T>(method: "GET" | "POST", body?: any): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) throw new ApiError(401, "SIGN_IN_REQUIRED");
  if (method === "GET") {
    const { data: rows, error } = await supabase.rpc("admin_list_coupons");
    if (error) throw new ApiError(400, error.message.split(" \n")[0] || "COUPONS_UNAVAILABLE");
    return { coupons: rows ?? [] } as T;
  }
  const { data: row, error } = await supabase.rpc("admin_create_coupon", {
    p_code: body?.code ?? "", p_grant_days: Number(body?.grant_days ?? 30),
    p_max_redemptions: body?.max_redemptions ?? null,
    p_valid_until: body?.valid_until ? `${body.valid_until}T23:59:59Z` : null,
  });
  if (error) throw new ApiError(400, error.message.split(" \n")[0] || "COUPON_CREATE_FAILED");
  return row as T;
}

export async function couponRedeem<T>(code: string): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) throw new ApiError(401, "SIGN_IN_REQUIRED");
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coupon-redeem-api`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
    body: JSON.stringify({ code }),
  });
  const payload = await response.json().catch(() => ({})) as { error?: unknown };
  if (!response.ok) throw new ApiError(response.status, typeof payload.error === "string" ? payload.error : "REQUEST_FAILED");
  return payload as T;
}
