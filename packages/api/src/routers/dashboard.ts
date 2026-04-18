import { eq, and, desc, gte, lte, isNotNull, asc, count } from "drizzle-orm";
import { db, tasks, notes, exams, internships, groupMembers } from "@student-platform/db";
import { router, protectedProcedure } from "../trpc";

export const dashboardRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const weekAhead = new Date(now);
    weekAhead.setDate(weekAhead.getDate() + 14);

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    const [todayTasks, upcomingExams, recentNotes, internshipRows, groupCountRow] =
      await Promise.all([
        db
          .select()
          .from(tasks)
          .where(
            and(
              eq(tasks.userId, ctx.userId),
              isNotNull(tasks.dueDate),
              gte(tasks.dueDate, startToday),
              lte(tasks.dueDate, endToday),
            ),
          )
          .orderBy(desc(tasks.priority))
          .limit(8),
        db
          .select()
          .from(exams)
          .where(
            and(eq(exams.userId, ctx.userId), gte(exams.date, now), lte(exams.date, weekAhead)),
          )
          .orderBy(asc(exams.date))
          .limit(5),
        db
          .select()
          .from(notes)
          .where(eq(notes.userId, ctx.userId))
          .orderBy(desc(notes.updatedAt))
          .limit(5),
        db
          .select()
          .from(internships)
          .where(eq(internships.userId, ctx.userId))
          .orderBy(desc(internships.appliedDate))
          .limit(5),
        db
          .select({ value: count() })
          .from(groupMembers)
          .where(eq(groupMembers.userId, ctx.userId)),
      ]);

    return {
      todayTasks,
      upcomingExams,
      recentNotes,
      recentInternships: internshipRows,
      studyGroupCount: Number(groupCountRow[0]?.value ?? 0),
    };
  }),
});
