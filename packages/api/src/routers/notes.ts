import { eq, and, desc, or, ilike } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, notes, subjects } from "@student-platform/db";
import { router, protectedProcedure } from "../trpc";

function newId() {
  return crypto.randomUUID();
}

export const notesRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        content: z.string().max(100_000).default(""),
        subjectId: z.string().uuid().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.subjectId) {
        const [s] = await db
          .select({ id: subjects.id })
          .from(subjects)
          .where(and(eq(subjects.id, input.subjectId), eq(subjects.userId, ctx.userId)));
        if (!s) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid subject" });
      }
      const id = newId();
      await db.insert(notes).values({
        id,
        title: input.title,
        content: input.content,
        subjectId: input.subjectId ?? null,
        userId: ctx.userId,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(500).optional(),
        content: z.string().max(100_000).optional(),
        subjectId: z.string().uuid().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await db
        .select({ id: notes.id })
        .from(notes)
        .where(and(eq(notes.id, id), eq(notes.userId, ctx.userId)));
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });

      if (rest.subjectId) {
        const [s] = await db
          .select({ id: subjects.id })
          .from(subjects)
          .where(and(eq(subjects.id, rest.subjectId), eq(subjects.userId, ctx.userId)));
        if (!s) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid subject" });
      }

      const patch: Partial<typeof notes.$inferInsert> = {};
      if (rest.title !== undefined) patch.title = rest.title;
      if (rest.content !== undefined) patch.content = rest.content;
      if (rest.subjectId !== undefined) patch.subjectId = rest.subjectId;

      if (Object.keys(patch).length) {
        await db.update(notes).set(patch).where(eq(notes.id, id));
      }
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const res = await db
        .delete(notes)
        .where(and(eq(notes.id, input.id), eq(notes.userId, ctx.userId)))
        .returning({ id: notes.id });
      if (!res.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
      return { ok: true as const };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [row] = await db
        .select()
        .from(notes)
        .where(and(eq(notes.id, input.id), eq(notes.userId, ctx.userId)));
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
      return row;
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(30),
          subjectId: z.string().uuid().optional(),
          q: z.string().max(200).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 30;
      const conditions = [eq(notes.userId, ctx.userId)];
      if (input?.subjectId) conditions.push(eq(notes.subjectId, input.subjectId));
      if (input?.q?.trim()) {
        const term = `%${input.q.trim()}%`;
        conditions.push(or(ilike(notes.title, term), ilike(notes.content, term))!);
      }

      const rows = await db
        .select()
        .from(notes)
        .where(and(...conditions))
        .orderBy(desc(notes.updatedAt))
        .limit(limit);

      return { items: rows };
    }),
});
