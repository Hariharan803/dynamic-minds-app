import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, subjects, exams, planEntries } from "@student-platform/db";
import { router, protectedProcedure } from "../trpc";

function newId() {
  return crypto.randomUUID();
}

const dayOfWeek = z.number().int().min(0).max(6);

export const plannerRouter = router({
  subjectCreate: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const id = newId();
      await db.insert(subjects).values({ id, name: input.name, userId: ctx.userId });
      return { id };
    }),

  subjectList: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(subjects)
      .where(eq(subjects.userId, ctx.userId))
      .orderBy(asc(subjects.name));
  }),

  subjectDelete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const res = await db
        .delete(subjects)
        .where(and(eq(subjects.id, input.id), eq(subjects.userId, ctx.userId)))
        .returning({ id: subjects.id });
      if (!res.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "Subject not found" });
      return { ok: true as const };
    }),

  examCreate: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        date: z.coerce.date(),
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
      await db.insert(exams).values({
        id,
        title: input.title,
        date: input.date,
        subjectId: input.subjectId ?? null,
        userId: ctx.userId,
      });
      return { id };
    }),

  examList: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(exams)
      .where(eq(exams.userId, ctx.userId))
      .orderBy(asc(exams.date));
  }),

  examDelete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const res = await db
        .delete(exams)
        .where(and(eq(exams.id, input.id), eq(exams.userId, ctx.userId)))
        .returning({ id: exams.id });
      if (!res.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });
      return { ok: true as const };
    }),

  planList: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(planEntries)
      .where(eq(planEntries.userId, ctx.userId))
      .orderBy(asc(planEntries.dayOfWeek), asc(planEntries.sortOrder));
  }),

  planUpsert: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        dayOfWeek: dayOfWeek,
        title: z.string().min(1).max(500),
        subjectId: z.string().uuid().optional().nullable(),
        sortOrder: z.number().int().optional(),
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

      if (input.id) {
        const [row] = await db
          .select({ id: planEntries.id })
          .from(planEntries)
          .where(and(eq(planEntries.id, input.id), eq(planEntries.userId, ctx.userId)));
        if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Plan entry not found" });
        await db
          .update(planEntries)
          .set({
            dayOfWeek: input.dayOfWeek,
            title: input.title,
            subjectId: input.subjectId ?? null,
            sortOrder: input.sortOrder ?? 0,
          })
          .where(eq(planEntries.id, input.id));
        return { id: input.id };
      }

      const id = newId();
      await db.insert(planEntries).values({
        id,
        userId: ctx.userId,
        dayOfWeek: input.dayOfWeek,
        title: input.title,
        subjectId: input.subjectId ?? null,
        sortOrder: input.sortOrder ?? 0,
      });
      return { id };
    }),

  planDelete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const res = await db
        .delete(planEntries)
        .where(and(eq(planEntries.id, input.id), eq(planEntries.userId, ctx.userId)))
        .returning({ id: planEntries.id });
      if (!res.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "Plan entry not found" });
      return { ok: true as const };
    }),
});
