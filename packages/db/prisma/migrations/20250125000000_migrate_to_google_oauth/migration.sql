-- Delete existing users since they can't authenticate without passwords
-- This is safe because Google OAuth is the only auth method now
DELETE FROM "User";

-- AlterTable: Remove old columns and add new ones
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN "name" TEXT,
ADD COLUMN "image" TEXT,
ADD COLUMN "googleId" TEXT;

-- CreateIndex: Make googleId unique
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- Update the schema: Make name and googleId required (we'll do this in a follow-up migration after data is migrated)
-- For now, we keep them nullable to allow the migration to complete

