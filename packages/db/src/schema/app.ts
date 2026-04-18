import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const internshipStatusEnum = pgEnum("internship_status", [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);

export const groupRoleEnum = pgEnum("group_role", ["owner", "admin", "member"]);

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    dueDate: timestamp("due_date", { mode: "date", withTimezone: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("tasks_user_id_idx").on(t.userId), index("tasks_due_date_idx").on(t.dueDate)],
);

export const subjects = pgTable(
  "subjects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("subjects_user_id_idx").on(t.userId)],
);

export const notes = pgTable(
  "notes",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    subjectId: text("subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("notes_user_id_idx").on(t.userId),
    index("notes_subject_id_idx").on(t.subjectId),
  ],
);

export const exams = pgTable(
  "exams",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
    subjectId: text("subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [
    index("exams_user_id_idx").on(t.userId),
    index("exams_date_idx").on(t.date),
  ],
);

/** Weekly planner rows (e.g. Monday: DSA practice) */
export const planEntries = pgTable(
  "plan_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** 0 = Sunday … 6 = Saturday */
    dayOfWeek: integer("day_of_week").notNull(),
    title: text("title").notNull(),
    subjectId: text("subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("plan_entries_user_day_idx").on(t.userId, t.dayOfWeek)],
);

export const internships = pgTable(
  "internships",
  {
    id: text("id").primaryKey(),
    company: text("company").notNull(),
    position: text("position").notNull(),
    status: internshipStatusEnum("status").notNull().default("applied"),
    appliedDate: timestamp("applied_date", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("internships_user_id_idx").on(t.userId)],
);

export const studyGroups = pgTable(
  "study_groups",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("study_groups_owner_id_idx").on(t.ownerId)],
);

export const groupMembers = pgTable(
  "group_members",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => studyGroups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: groupRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("group_members_group_user_uidx").on(t.groupId, t.userId),
    index("group_members_user_id_idx").on(t.userId),
  ],
);

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  user: one(user, { fields: [subjects.userId], references: [user.id] }),
  notes: many(notes),
  exams: many(exams),
  planEntries: many(planEntries),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(user, { fields: [notes.userId], references: [user.id] }),
  subject: one(subjects, {
    fields: [notes.subjectId],
    references: [subjects.id],
  }),
}));

export const examsRelations = relations(exams, ({ one }) => ({
  user: one(user, { fields: [exams.userId], references: [user.id] }),
  subject: one(subjects, {
    fields: [exams.subjectId],
    references: [subjects.id],
  }),
}));

export const planEntriesRelations = relations(planEntries, ({ one }) => ({
  user: one(user, { fields: [planEntries.userId], references: [user.id] }),
  subject: one(subjects, {
    fields: [planEntries.subjectId],
    references: [subjects.id],
  }),
}));

export const studyGroupsRelations = relations(studyGroups, ({ one, many }) => ({
  owner: one(user, {
    fields: [studyGroups.ownerId],
    references: [user.id],
  }),
  members: many(groupMembers),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(studyGroups, {
    fields: [groupMembers.groupId],
    references: [studyGroups.id],
  }),
  user: one(user, { fields: [groupMembers.userId], references: [user.id] }),
}));
