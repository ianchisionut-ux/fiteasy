ALTER TABLE "Entry" ADD COLUMN "coachNote" TEXT NOT NULL DEFAULT '';

CREATE TABLE "Intake" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "medicalHistory" TEXT NOT NULL DEFAULT '',
  "injuries" TEXT NOT NULL DEFAULT '',
  "experienceLevel" TEXT NOT NULL DEFAULT '',
  "lifestyle" TEXT NOT NULL DEFAULT '',
  "foodPreferences" TEXT NOT NULL DEFAULT '',
  "goals" TEXT NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Intake_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Intake_clientId_key" ON "Intake"("clientId");

CREATE TABLE "Measurement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "weight" DOUBLE PRECISION,
  "waist" DOUBLE PRECISION,
  "hips" DOUBLE PRECISION,
  "arms" DOUBLE PRECISION,
  "thighs" DOUBLE PRECISION,
  "notes" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "Measurement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Measurement_clientId_date_idx" ON "Measurement"("clientId", "date");

CREATE TABLE "HabitLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "waterMl" INTEGER,
  "steps" INTEGER,
  "sleepHours" DOUBLE PRECISION,
  CONSTRAINT "HabitLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HabitLog_clientId_date_key" ON "HabitLog"("clientId", "date");

CREATE TABLE "CheckIn" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "weekOf" TEXT NOT NULL,
  "avgWeight" DOUBLE PRECISION,
  "energyLevel" INTEGER,
  "dietAdherencePercent" INTEGER,
  "difficulties" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CheckIn_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CheckIn_clientId_weekOf_key" ON "CheckIn"("clientId", "weekOf");
