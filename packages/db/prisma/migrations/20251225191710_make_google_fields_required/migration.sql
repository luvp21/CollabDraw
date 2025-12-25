-- Make name and googleId required (NOT NULL)
-- This is safe because all new users will have these fields via Google OAuth
ALTER TABLE "User" 
  ALTER COLUMN "name" SET NOT NULL,
  ALTER COLUMN "googleId" SET NOT NULL;
