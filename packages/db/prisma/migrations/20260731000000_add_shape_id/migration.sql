-- Add a stable client-generated shape identifier so erase/delete operations
-- can target a specific shape row instead of string-matching the whole
-- serialized `data` blob (which never matched the erase payload).
ALTER TABLE "Shape" ADD COLUMN "shapeId" TEXT;

CREATE INDEX "Shape_roomId_shapeId_idx" ON "Shape"("roomId", "shapeId");
