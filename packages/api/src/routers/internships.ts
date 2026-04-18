import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, internships } from "@student-platform/db";
import { router, protectedProcedure } from "../trpc";

const status = z.enum([
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);

function newId() {
  return crypto.randomUUID();
}

export const internshipsRouter = router({
  add: protectedProcedure
    .input(
      z.object({
        company: z.string().min(1).max(300),
        position: z.string().min(1).max(300),
        status: status.optional(),
        appliedDate: z.coerce.date(),
        notes: z.string().max(10_000).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = newId();
      await db.insert(internships).values({
        id,
        company: input.company,
        position: input.position,
        status: input.status ?? "applied",
        appliedDate: input.appliedDate,
        userId: ctx.userId,
        notes: input.notes ?? null,
      });
      return { id };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: status,
        notes: z.string().max(10_000).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const patch: Partial<typeof internships.$inferInsert> = { status: input.status };
      if (input.notes !== undefined) patch.notes = input.notes;

      const res = await db
        .update(internships)
        .set(patch)
        .where(and(eq(internships.id, input.id), eq(internships.userId, ctx.userId)))
        .returning({ id: internships.id });
      if (!res.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "Internship not found" });
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const res = await db
        .delete(internships)
        .where(and(eq(internships.id, input.id), eq(internships.userId, ctx.userId)))
        .returning({ id: internships.id });
      if (!res.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "Internship not found" });
      return { ok: true as const };
    }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const rows = await db
        .select()
        .from(internships)
        .where(eq(internships.userId, ctx.userId))
        .orderBy(desc(internships.appliedDate))
        .limit(limit);
      return { items: rows };
    }),
});
