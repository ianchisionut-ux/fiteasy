-- Structured coach management: programs, reminders, notes and progress records.
CREATE TABLE "Program" (
  "id" TEXT NOT NULL,
  "instructorId" TEXT NOT NULL,
  "clientId" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "kind" TEXT NOT NULL DEFAULT 'WORKOUT',
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Program_instructorId_kind_idx" ON "Program"("instructorId", "kind");
CREATE INDEX "Program_clientId_idx" ON "Program"("clientId");
ALTER TABLE "Program" ADD CONSTRAINT "Program_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Program" ADD CONSTRAINT "Program_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Reminder" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "details" TEXT NOT NULL DEFAULT '',
  "time" TEXT NOT NULL DEFAULT '09:00',
  "days" TEXT NOT NULL DEFAULT '',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Reminder_clientId_active_idx" ON "Reminder"("clientId", "active");
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ClientNote" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "pinned" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClientNote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ClientNote_clientId_updatedAt_idx" ON "ClientNote"("clientId", "updatedAt");
ALTER TABLE "ClientNote" ADD CONSTRAINT "ClientNote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProgressRecord" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "exerciseName" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "weight" DOUBLE PRECISION,
  "reps" INTEGER,
  "source" TEXT NOT NULL DEFAULT 'MANUAL',
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgressRecord_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProgressRecord_clientId_exerciseName_date_idx" ON "ProgressRecord"("clientId", "exerciseName", "date");
ALTER TABLE "ProgressRecord" ADD CONSTRAINT "ProgressRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "NutritionGoal" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "startDate" TEXT NOT NULL,
  "calories" INTEGER NOT NULL,
  "proteinPercent" INTEGER NOT NULL DEFAULT 30,
  "fatPercent" INTEGER NOT NULL DEFAULT 30,
  "carbsPercent" INTEGER NOT NULL DEFAULT 40,
  "saturatedFat" INTEGER,
  "cholesterol" INTEGER,
  "fibers" INTEGER,
  "sugars" INTEGER,
  "sodium" INTEGER,
  "days" TEXT NOT NULL DEFAULT '1,2,3,4,5,6,0',
  "repeatWeeks" INTEGER NOT NULL DEFAULT 1,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NutritionGoal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "NutritionGoal_clientId_active_idx" ON "NutritionGoal"("clientId", "active");
ALTER TABLE "NutritionGoal" ADD CONSTRAINT "NutritionGoal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Announcement" (
  "id" TEXT NOT NULL,
  "instructorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Announcement_instructorId_active_idx" ON "Announcement"("instructorId", "active");
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
