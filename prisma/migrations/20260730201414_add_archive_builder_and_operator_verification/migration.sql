-- CreateTable
CREATE TABLE "Operator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roles" TEXT NOT NULL DEFAULT 'reviewer',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecognitionCase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "original_photo_path" TEXT NOT NULL,
    "ai_candidate_person_id" INTEGER,
    "ai_confidence" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "confirm_count" INTEGER NOT NULL DEFAULT 0,
    "reject_match_count" INTEGER NOT NULL DEFAULT 0,
    "ai_error_count" INTEGER NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" DATETIME,
    "source_event_id" INTEGER
);

-- CreateTable
CREATE TABLE "OperatorDecision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "case_id" INTEGER NOT NULL,
    "operator_id" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "screen_path" TEXT,
    "comment" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperatorDecision_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "RecognitionCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OperatorDecision_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "start_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operator" TEXT,
    "workspace" TEXT NOT NULL,
    "total_files" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "rejected" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "last_checkpoint_at" DATETIME,
    "last_checkpoint_progress" INTEGER NOT NULL DEFAULT 0,
    "ended_at" DATETIME
);

-- CreateTable
CREATE TABLE "ArchiveTask" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "import_session_id" INTEGER NOT NULL,
    CONSTRAINT "ArchiveTask_import_session_id_fkey" FOREIGN KEY ("import_session_id") REFERENCES "ImportSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Operator_email_key" ON "Operator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RecognitionCase_source_event_id_key" ON "RecognitionCase"("source_event_id");

-- CreateIndex
CREATE INDEX "OperatorDecision_case_id_idx" ON "OperatorDecision"("case_id");

-- CreateIndex
CREATE INDEX "OperatorDecision_operator_id_idx" ON "OperatorDecision"("operator_id");

-- CreateIndex
CREATE INDEX "OperatorDecision_decision_idx" ON "OperatorDecision"("decision");

-- CreateIndex
CREATE INDEX "ArchiveTask_photo_hash_idx" ON "ArchiveTask"("photo_hash");

-- CreateIndex
CREATE INDEX "ArchiveTask_status_idx" ON "ArchiveTask"("status");

-- CreateIndex
CREATE INDEX "ArchiveTask_import_session_id_idx" ON "ArchiveTask"("import_session_id");
