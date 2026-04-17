import { NextResponse } from "next/server";

const DEFAULT_BACKEND_API_URL = "http://localhost:8000/api";

type ProxyOptions = RequestInit & {
  requiresApiKey?: boolean;
};

async function fetchBackend(
  path: string,
  { requiresApiKey = true, ...options }: ProxyOptions = {},
) {
  const apiBaseUrl = process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_API_URL;
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresApiKey) {
    const apiKey = process.env.BACKEND_API_KEY;

    if (!apiKey) {
      throw new Error("BACKEND_API_KEY no esta configurada.");
    }

    headers.set("X-API-KEY", apiKey);
  }

  return fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
}

export async function proxyBackend(
  path: string,
  options: ProxyOptions = {},
) {
  try {
    const response = await fetchBackend(path, options);
    const body = await response.text();
    const contentType =
      response.headers.get("content-type") ?? "application/json";

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No fue posible conectar con el backend.",
      },
      { status: 500 },
    );
  }
}
