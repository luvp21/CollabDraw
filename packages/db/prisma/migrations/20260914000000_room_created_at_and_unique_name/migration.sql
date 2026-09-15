-- Room previously had no createdAt, so the dashboard fell back to
-- `Date.now()` and showed every room as "created less than a minute ago".
ALTER TABLE "Room" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- roomName uniqueness was only checked in application code (findFirst then
-- create), which is a TOCTOU race: two concurrent requests for the same
-- name could both pass the check and create duplicate rooms. Enforce it at
-- the database level; the app-level check stays as a fast path for a
-- friendly error message.
CREATE UNIQUE INDEX "Room_roomName_key" ON "Room"("roomName");
