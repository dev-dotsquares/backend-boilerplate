interface ValidatedData {
  body?: unknown;
  params?: unknown;
  query?: unknown;
}

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

declare namespace Express {
  interface Request {
    requestId: string;
    validated: ValidatedData;
    user?: AuthUser | undefined;
  }
}
