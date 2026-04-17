import { proxyBackend } from "@/lib/backend";

export async function GET() {
  return proxyBackend("/products", {
    method: "GET",
  });
}

export async function POST(request: Request) {
  const body = await request.text();

  return proxyBackend("/products", {
    method: "POST",
    body,
  });
}
