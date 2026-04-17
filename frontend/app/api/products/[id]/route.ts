import { proxyBackend } from "@/lib/backend";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const body = await request.text();
  const { id } = await context.params;

  return proxyBackend(`/products/${id}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyBackend(`/products/${id}`, {
    method: "DELETE",
  });
}
