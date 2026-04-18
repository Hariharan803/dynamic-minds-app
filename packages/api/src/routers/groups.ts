import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db, studyGroups, groupMembers } from "@student-platform/db";
import { router, protectedProcedure } from "../trpc";

function newId() {
  return crypto.randomUUID();
}

export const groupsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const groupId = newId();
      const memberId = newId();
      await db.insert(studyGroups).values({
        id: groupId,
        name: input.name,
        description: input.description ?? null,
        ownerId: ctx.userId,
      });
      await db.insert(groupMembers).values({
        id: memberId,
        groupId,
        userId: ctx.userId,
        role: "owner",
      });
      return { id: groupId };
    }),

  join: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [g] = await db
        .select({ id: studyGroups.id })
        .from(studyGroups)
        .where(eq(studyGroups.id, input.groupId));
      if (!g) throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });

      const [existing] = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, ctx.userId)),
        );
      if (existing) return { ok: true as const, alreadyMember: true };

      await db.insert(groupMembers).values({
        id: newId(),
        groupId: input.groupId,
        userId: ctx.userId,
        role: "member",
      });
      return { ok: true as const, alreadyMember: false };
    }),

  leave: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [g] = await db
        .select({ ownerId: studyGroups.ownerId })
        .from(studyGroups)
        .where(eq(studyGroups.id, input.groupId));
      if (!g) throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      if (g.ownerId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transfer ownership or delete the group instead of leaving",
        });
      }

      await db
        .delete(groupMembers)
        .where(
          and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, ctx.userId)),
        );
      return { ok: true as const };
    }),

  members: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [membership] = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, ctx.userId)),
        );
      if (!membership)
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a group member" });

      return await db
        .select({
          id: groupMembers.id,
          userId: groupMembers.userId,
          role: groupMembers.role,
          joinedAt: groupMembers.joinedAt,
        })
        .from(groupMembers)
        .where(eq(groupMembers.groupId, input.groupId))
        .orderBy(asc(groupMembers.joinedAt));
    }),

  myGroups: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        group: studyGroups,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .innerJoin(studyGroups, eq(groupMembers.groupId, studyGroups.id))
      .where(eq(groupMembers.userId, ctx.userId))
      .orderBy(asc(studyGroups.name));

    return rows;
  }),
});
