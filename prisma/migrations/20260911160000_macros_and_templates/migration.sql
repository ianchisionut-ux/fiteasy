ALTER TABLE "Client" ADD COLUMN "dailyProteinTarget" INTEGER;
ALTER TABLE "Client" ADD COLUMN "dailyCarbsTarget" INTEGER;
ALTER TABLE "Client" ADD COLUMN "dailyFatTarget" INTEGER;
ALTER TABLE "Client" ADD COLUMN "dailyCaloriesTarget" INTEGER;

ALTER TABLE "Entry" ADD COLUMN "protein" INTEGER;
ALTER TABLE "Entry" ADD COLUMN "carbs" INTEGER;
ALTER TABLE "Entry" ADD COLUMN "fat" INTEGER;
ALTER TABLE "Entry" ADD COLUMN "calories" INTEGER;

CREATE TABLE "Template" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "instructorId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Template_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Template_instructorId_kind_idx" ON "Template"("instructorId", "kind");
