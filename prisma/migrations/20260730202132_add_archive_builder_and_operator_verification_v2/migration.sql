/*
  Warnings:

  - You are about to drop the `OperatorDecision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecognitionCase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `operator` on the `ImportSession` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Operator` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Operator` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `Operator` table. All the data in the column will be lost.
  - Added the required column `display_name` to the `Operator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `login` to the `Operator` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "OperatorDecision_decision_idx";

-- DropIndex
DROP INDEX "OperatorDecision_operator_id_idx";

-- DropIndex
DROP INDEX "OperatorDecision_case_id_idx";

-- DropIndex
DROP INDEX "RecognitionCase_source_event_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OperatorDecision";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RecognitionCase";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RecognitionIncident" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "original_photo_path" TEXT NOT NULL,
    "ai_candidate_person_id" INTEGER,
    "ai_confidence" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" DATETIME,
    "source_event_id" INTEGER
);

-- CreateTable
CREATE TABLE "OperatorVerdict" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "incident_id" INTEGER NOT NULL,
    "operator_id" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "screen_path" TEXT,
    "comment" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperatorVerdict_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "RecognitionIncident" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OperatorVerdict_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArchiveTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "photo_hash" TEXT NOT NULL,
    "photo_path" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "embedding_status" TEXT NOT NULL DEFAULT 'PENDING',
    "thumbnail_status" TEXT NOT NULL DEFAULT 'PENDING',
    "database_status" TEXT NOT NULL DEFAULT 'PENDING',
    "faiss_status" TEXT NOT NULL DEFAULT 'PENDING',
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
INSERT INTO "new_ArchiveTask" ("created_at", "database_error", "database_status", "embedding_error", "embedding_status", "faiss_error", "faiss_status", "id", "import_session_id", "photo_hash", "photo_path", "status", "thumbnail_error", "thumbnail_status", "updated_at") SELECT "created_at", "database_error", "database_status", "embedding_error", "embedding_status", "faiss_error", "faiss_status", "id", "import_session_id", "photo_hash", "photo_path", "status", "thumbnail_error", "thumbnail_status", "updated_at" FROM "ArchiveTask";
DROP TABLE "ArchiveTask";
ALTER TABLE "new_ArchiveTask" RENAME TO "ArchiveTask";
CREATE INDEX "ArchiveTask_photo_hash_idx" ON "ArchiveTask"("photo_hash");
CREATE INDEX "ArchiveTask_status_idx" ON "ArchiveTask"("status");
CREATE INDEX "ArchiveTask_import_session_id_idx" ON "ArchiveTask"("import_session_id");
CREATE TABLE "new_ImportSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "start_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operator_login" TEXT,
    "workspace" TEXT NOT NULL,
    "machine_name" TEXT,
    "app_version" TEXT,
    "model_version" TEXT,
    "gpu" TEXT,
    "cpu" TEXT,
    "workspace_version" TEXT,
    "total_files" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "rejected" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "last_checkpoint_at" DATETIME,
    "last_checkpoint_progress" INTEGER NOT NULL DEFAULT 0,
    "ended_at" DATETIME
);
INSERT INTO "new_ImportSession" ("completed", "ended_at", "errors", "id", "last_checkpoint_at", "last_checkpoint_progress", "rejected", "start_time", "status", "total_files", "workspace") SELECT "completed", "ended_at", "errors", "id", "last_checkpoint_at", "last_checkpoint_progress", "rejected", "start_time", "status", "total_files", "workspace" FROM "ImportSession";
DROP TABLE "ImportSession";
ALTER TABLE "new_ImportSession" RENAME TO "ImportSession";
CREATE TABLE "new_Operator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "login" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "location" TEXT,
    "checkpoint" TEXT,
    "role" TEXT NOT NULL DEFAULT 'reviewer',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Operator" ("created_at", "id") SELECT "created_at", "id" FROM "Operator";
DROP TABLE "Operator";
ALTER TABLE "new_Operator" RENAME TO "Operator";
CREATE UNIQUE INDEX "Operator_login_key" ON "Operator"("login");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RecognitionIncident_source_event_id_key" ON "RecognitionIncident"("source_event_id");

-- CreateIndex
CREATE INDEX "OperatorVerdict_incident_id_idx" ON "OperatorVerdict"("incident_id");

-- CreateIndex
CREATE INDEX "OperatorVerdict_operator_id_idx" ON "OperatorVerdict"("operator_id");

-- CreateIndex
CREATE INDEX "OperatorVerdict_decision_idx" ON "OperatorVerdict"("decision");
