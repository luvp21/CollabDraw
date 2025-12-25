-- Delete existing data since old users can't authenticate without passwords
-- Delete shapes first (they reference rooms)
DELETE FROM "Shape";

-- Delete rooms (they reference users)
DELETE FROM "Room";

-- Delete existing users (they can't authenticate without passwords anyway)
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

