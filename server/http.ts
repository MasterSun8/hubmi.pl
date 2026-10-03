import type { NextRequest } from "next/server";
import { z } from "zod";
import { AiNotImplementedError } from "./ai/types";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what = "Resource") => new HttpError(404, `${what} not found`);

type Handler<C> = (request: NextRequest, context: C) => Promise<Response>;

// Wspólna obsługa błędów dla Route Handlers.
export function route<C>(fn: Handler<C>): Handler<C> {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return Response.json({ error: error.message, details: error.details }, { status: error.status });
      }
      if (error instanceof z.ZodError) {
        return Response.json({ error: "Validation failed", details: z.flattenError(error) }, { status: 400 });
      }
      if (error instanceof AiNotImplementedError) {
        return Response.json({ error: error.message }, { status: 501 });
      }
      console.error(error);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  return schema.parse(json);
}

export function parseQuery<T extends z.ZodType>(request: NextRequest, schema: T): z.infer<T> {
  return schema.parse(Object.fromEntries(request.nextUrl.searchParams));
}

export const idParam = z.uuid();

export type IdContext = { params: Promise<{ id: string }> };

export async function getId(context: { params: Promise<{ id: string }> }): Promise<string> {
  const { id } = await context.params;
  const parsed = idParam.safeParse(id);
  if (!parsed.success) throw notFound();
  return parsed.data;
}

