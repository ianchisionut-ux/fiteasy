ALTER TABLE "Instructor" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Instructor" ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Contul existent (creat prin /api/setup) devine administratorul platformei.
UPDATE "Instructor" SET "isSuperAdmin" = true;
