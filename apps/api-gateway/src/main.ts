import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

type UpstreamName = "backend" | "query-engine";

const PORT = Number.parseInt(process.env.PORT ?? "4000", 10);
const FRONTEND_ORIGINS = parseAllowedOrigins(
  process.env.CORS_ORIGINS ??
    process.env.FRONTEND_URL ??
    "http://localhost:3000",
);
const BACKEND_URL = normalizeBaseUrl(
  process.env.BACKEND_URL ?? "http://localhost:3001",
);
const QUERY_ENGINE_URL = normalizeBaseUrl(
  process.env.QUERY_ENGINE_URL ?? "http://localhost:8000",
);

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");

    if (requestUrl.pathname === "/health") {
      sendJson(response, 200, {
        status: "ok",
        service: "api-gateway",
      });
      return;
    }

    if (request.method === "OPTIONS") {
      handleCorsPreflight(request, response);
      return;
    }

    if (requestUrl.pathname === "/health/backend") {
      await proxyRequest(request, response, "backend", "/");
      return;
    }

    if (requestUrl.pathname === "/health/query") {
      await proxyRequest(request, response, "query-engine", "/health");
      return;
    }

    if (
      requestUrl.pathname === "/query" ||
      requestUrl.pathname.startsWith("/query/")
    ) {
      await proxyRequest(
        request,
        response,
        "query-engine",
        requestUrl.pathname + requestUrl.search,
      );
      return;
    }

    if (
      requestUrl.pathname === "/api/query" ||
      requestUrl.pathname.startsWith("/api/query/")
    ) {
      await proxyRequest(
        request,
        response,
        "query-engine",
        `${requestUrl.pathname.slice(4)}${requestUrl.search}`,
      );
      return;
    }

    const backendPath = requestUrl.pathname.startsWith("/api")
      ? `${requestUrl.pathname.slice(4) || "/"}${requestUrl.search}`
      : `${requestUrl.pathname}${requestUrl.search}`;

    await proxyRequest(request, response, "backend", backendPath);
  } catch (error) {
    console.error("Gateway request failed:", error);
    if (!response.headersSent) {
      sendJson(response, 502, {
        status: "error",
        message: "Gateway failed to process the request",
      });
    }
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API gateway listening on http://0.0.0.0:${PORT}`);
});

async function proxyRequest(
  request: IncomingMessage,
  response: ServerResponse,
  upstreamName: UpstreamName,
  pathWithSearch: string,
): Promise<void> {
  const upstreamBaseUrl =
    upstreamName === "backend" ? BACKEND_URL : QUERY_ENGINE_URL;
  const upstreamUrl = new URL(pathWithSearch, upstreamBaseUrl);
  const method = request.method ?? "GET";
  const headers = new Headers();

  for (const [headerName, headerValue] of Object.entries(request.headers)) {
    if (!headerValue) {
      continue;
    }

    const normalizedHeaderName = headerName.toLowerCase();
    if (
      normalizedHeaderName === "host" ||
      HOP_BY_HOP_HEADERS.has(normalizedHeaderName)
    ) {
      continue;
    }

    headers.set(
      headerName,
      Array.isArray(headerValue) ? headerValue.join(",") : headerValue,
    );
  }

  const requestBody =
    method === "GET" || method === "HEAD"
      ? undefined
      : await readRequestBody(request);

  const upstreamResponse = await fetch(upstreamUrl, {
    method,
    headers,
    body: requestBody === undefined ? undefined : new Uint8Array(requestBody),
    redirect: "manual",
  });

  writeCorsHeaders(request, response);
  response.statusCode = upstreamResponse.status;
  upstreamResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      response.setHeader(key, value);
    }
  });

  const setCookie = getSetCookieHeaders(upstreamResponse.headers);
  if (setCookie.length > 0) {
    response.setHeader("set-cookie", setCookie);
  }

  const responseBody = Buffer.from(await upstreamResponse.arrayBuffer());
  response.end(responseBody);
}

async function readRequestBody(
  request: IncomingMessage,
): Promise<Buffer | undefined> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return undefined;
  }

  return Buffer.concat(chunks);
}

function handleCorsPreflight(
  request: IncomingMessage,
  response: ServerResponse,
): void {
  writeCorsHeaders(request, response);
  response.statusCode = 204;
  response.end();
}

function writeCorsHeaders(
  request: IncomingMessage,
  response: ServerResponse,
): void {
  const requestOrigin = request.headers.origin;
  if (!requestOrigin || !FRONTEND_ORIGINS.includes(requestOrigin)) {
    return;
  }

  response.setHeader("access-control-allow-origin", requestOrigin);
  response.setHeader("access-control-allow-credentials", "true");
  response.setHeader(
    "access-control-allow-methods",
    "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  response.setHeader(
    "access-control-allow-headers",
    request.headers["access-control-request-headers"] ??
      "Authorization,Content-Type,Accept,Origin",
  );
  response.setHeader(
    "access-control-expose-headers",
    "Content-Length,Content-Type,Location",
  );
  response.setHeader("vary", "Origin");
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function normalizeBaseUrl(rawValue: string): string {
  const value = rawValue.trim();
  if (value.length === 0) {
    throw new Error("Upstream URL cannot be empty");
  }

  const url = new URL(value);
  return url.toString().replace(/\/$/, "");
}

function parseAllowedOrigins(rawValue: string): string[] {
  return rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function getSetCookieHeaders(headers: Headers): string[] {
  const headerValues = headers.getSetCookie?.();
  return Array.isArray(headerValues) ? headerValues : [];
}
