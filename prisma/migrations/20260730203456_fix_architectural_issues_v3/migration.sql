/*
  Warnings:

  - You are about to drop the column `database_status` on the `ArchiveTask` table. All the data in the column will be lost.
  - You are about to drop the column `embedding_status` on the `ArchiveTask` table. All the data in the column will be lost.
  - You are about to drop the column `faiss_status` on the `ArchiveTask` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail_status` on the `ArchiveTask` table. All the data in the column will be lost.
  - You are about to drop the column `checkpoint` on the `Operator` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Operator` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ArchiveTaskStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "task_id" INTEGER NOT NULL,
    "step" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "started_at" DATETIME,
    "finished_at" DATETIME,
    "error" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ArchiveTaskStep_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "ArchiveTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArchiveTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "photo_hash" TEXT NOT NULL,
    "photo_path" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "embedding_error" TEXT,
    "thumbnail_error" TEXT,
    "database_error" TEXT,
    "faiss_error" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "processing_time_ms" INTEGER,
    "embedding_time_ms" INTEGER,
    "quality_score" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "import_session_id" INTEGER NOT NULL,
    CONSTRAINT "ArchiveTask_import_session_id_fkey" FOREIGN KEY ("import_session_id") REFERENCES "ImportSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ArchiveTask" ("attempt", "created_at", "database_error", "embedding_error", "embedding_time_ms", "faiss_error", "id", "import_session_id", "last_error", "photo_hash", "photo_path", "processing_time_ms", "quality_score", "retry_count", "status", "thumbnail_error", "updated_at") SELECT "attempt", "created_at", "database_error", "embedding_error", "embedding_time_ms", "faiss_error", "id", "import_session_id", "last_error", "photo_hash", "photo_path", "processing_time_ms", "quality_score", "retry_count", "status", "thumbnail_error", "updated_at" FROM "ArchiveTask";
DROP TABLE "ArchiveTask";
ALTER TABLE "new_ArchiveTask" RENAME TO "ArchiveTask";
CREATE INDEX "ArchiveTask_photo_hash_idx" ON "ArchiveTask"("photo_hash");
CREATE INDEX "ArchiveTask_status_idx" ON "ArchiveTask"("status");
CREATE INDEX "ArchiveTask_import_session_id_idx" ON "ArchiveTask"("import_session_id");
CREATE TABLE "new_Operator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "login" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'reviewer',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Operator" ("active", "created_at", "display_name", "id", "login", "role") SELECT "active", "created_at", "display_name", "id", "login", "role" FROM "Operator";
DROP TABLE "Operator";
ALTER TABLE "new_Operator" RENAME TO "Operator";
CREATE UNIQUE INDEX "Operator_login_key" ON "Operator"("login");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ArchiveTaskStep_task_id_idx" ON "ArchiveTaskStep"("task_id");

-- CreateIndex
CREATE INDEX "ArchiveTaskStep_step_idx" ON "ArchiveTaskStep"("step");

-- CreateIndex
CREATE INDEX "ArchiveTaskStep_status_idx" ON "ArchiveTaskStep"("status");
