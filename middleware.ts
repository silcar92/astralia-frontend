import { NextRequest, NextResponse } from "next/server";

// Puerta de beta cerrada (Silvestre + esposa): si estas variables no están seteadas
// (ej. en local), el middleware no hace nada -- solo se activa en Render con las
// env vars puestas manualmente en el dashboard.
const BETA_GATE_USER = process.env.BETA_GATE_USER;
const BETA_GATE_PASSWORD = process.env.BETA_GATE_PASSWORD;

export function middleware(request: NextRequest) {
  if (!BETA_GATE_USER || !BETA_GATE_PASSWORD) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const [user, password] = atob(authHeader.slice(6)).split(":");
    if (user === BETA_GATE_USER && password === BETA_GATE_PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Astralia Beta"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
