import { eq, and, desc, gte, lte, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, tasks } from "@student-platform/db";
import { router, protectedProcedure } from "../trpc";

const taskStatus = z.enum(["todo", "in_progress", "done"]);
const taskPriority = z.enum(["low", "medium", "high"]);

function newId() {
  return crypto.randomUUID();
}

export const taskRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        description: z.string().max(10_000).optional(),
        status: taskStatus.optional(),
        priority: taskPriority.optional(),
        dueDate: z.coerce.date().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = newId();
      await db.insert(tasks).values({
        id,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? "todo",
        priority: input.priority ?? "medium",
        dueDate: input.dueDate ?? null,
        userId: ctx.userId,
      });
      return { id };
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          status: taskStatus.optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const conditions = [eq(tasks.userId, ctx.userId)];
      if (input?.status) conditions.push(eq(tasks.status, input.status));

      const rows = await db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt))
        .limit(limit);

      return { items: rows };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(500).optional(),
        description: z.string().max(10_000).optional().nullable(),
        status: taskStatus.optional(),
        priority: taskPriority.optional(),
        dueDate: z.coerce.date().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.userId)));
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });

      const patch: Record<string, unknown> = {};
      if (rest.title !== undefined) patch.title = rest.title;
      if (rest.description !== undefined) patch.description = rest.description;
      if (rest.status !== undefined) patch.status = rest.status;
      if (rest.priority !== undefined) patch.priority = rest.priority;
      if (rest.dueDate !== undefined) patch.dueDate = rest.dueDate;

      if (Object.keys(patch).length) {
        await db.update(tasks).set(patch).where(eq(tasks.id, id));
      }
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const res = await db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId)))
        .returning({ id: tasks.id });
      if (!res.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      return { ok: true as const };
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const res = await db
        .update(tasks)
        .set({ status: "done" })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId)))
        .returning({ id: tasks.id });
      if (!res.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      return { ok: true as const };
    }),

  dashboardToday: protectedProcedure.query(async ({ ctx }) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, ctx.userId),
          isNotNull(tasks.dueDate),
          gte(tasks.dueDate, start),
          lte(tasks.dueDate, end),
        ),
      )
      .orderBy(desc(tasks.priority));

    return todayTasks;
  }),
});
