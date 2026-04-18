import { router } from "./trpc";
import { taskRouter } from "./routers/tasks";
import { notesRouter } from "./routers/notes";
import { plannerRouter } from "./routers/planner";
import { internshipsRouter } from "./routers/internships";
import { groupsRouter } from "./routers/groups";
import { dashboardRouter } from "./routers/dashboard";

export const appRouter = router({
  task: taskRouter,
  notes: notesRouter,
  planner: plannerRouter,
  internship: internshipsRouter,
  group: groupsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
