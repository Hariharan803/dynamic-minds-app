export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AppSession = {
  session: { id: string; userId: string; expiresAt: Date };
  user: SessionUser;
};

export type CreateContextOptions = {
  session: AppSession | null;
};

export function createInnerContext(opts: CreateContextOptions) {
  return {
    session: opts.session,
  };
}

export type Context = ReturnType<typeof createInnerContext>;
