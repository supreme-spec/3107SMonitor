-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "server_decode_strategy" TEXT NOT NULL DEFAULT 'auto',
    "server_has_gpu" BOOLEAN NOT NULL DEFAULT false,
    "server_hw_min_cameras" INTEGER NOT NULL DEFAULT 4,
    "server_hw_min_pixels" INTEGER NOT NULL DEFAULT 8294400,
    "health_rules_version" TEXT NOT NULL DEFAULT 'v3',
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Camera" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "camera_type" TEXT NOT NULL DEFAULT 'USB',
    "zone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "roi_zones" TEXT,
    "exclusion_zones" TEXT,
    "detection_threshold" REAL,
    "min_face_size" INTEGER,
    "max_face_size" INTEGER,
    "fps" INTEGER NOT NULL DEFAULT 25,
    "ping_ms" INTEGER NOT NULL DEFAULT 0,
    "is_smart_recording" BOOLEAN NOT NULL DEFAULT false,
    "is_chronicle" BOOLEAN NOT NULL DEFAULT true,
    "driver_type" TEXT,
    "ip_address" TEXT,
    "ip_port" INTEGER,
    "username" TEXT,
    "password" TEXT,
    "use_camera_analytics" BOOLEAN NOT NULL DEFAULT false,
    "faiss_sync_status" TEXT DEFAULT 'SYNCED',
    "faiss_dirty_at" DATETIME,
    "passage_roi_x_min" REAL DEFAULT 0.3,
    "passage_roi_x_max" REAL DEFAULT 0.65,
    "passage_roi_y_min" REAL DEFAULT 0.1,
    "passage_roi_y_max" REAL DEFAULT 0.8,
    "guard_ignore_x_max" REAL DEFAULT 0.3,
    "detected_width" INTEGER,
    "detected_height" INTEGER,
    "detected_fps" REAL,
    "detected_codec" TEXT,
    "detected_bitrate_kbps" INTEGER,
    "detected_gop" INTEGER,
    "detected_at" DATETIME,
    "profile_version" INTEGER NOT NULL DEFAULT 1,
    "profile_needs_refresh" BOOLEAN NOT NULL DEFAULT false,
    "override_width" INTEGER,
    "override_height" INTEGER,
    "override_fps" REAL,
    "stream_main_url" TEXT,
    "stream_sub_url" TEXT,
    "use_substream_tracking" BOOLEAN NOT NULL DEFAULT true,
    "force_decode_strategy" TEXT,
    "detection_max_width" INTEGER NOT NULL DEFAULT 960,
    "roi_polygon" TEXT,
    "distance_calib_mode" TEXT,
    "person_calib_pts_px" TEXT,
    "person_calib_depth_m" TEXT,
    "floor_calib_pts_px" TEXT,
    "floor_calib_pts_m" TEXT,
    "floor_homography" TEXT,
    "stream_recommendation" TEXT,
    "ai_proxy_stats" TEXT,
    "feedback_counts" TEXT
);
INSERT INTO "new_Camera" ("camera_type", "created_at", "driver_type", "fps", "id", "ip_address", "ip_port", "is_active", "is_chronicle", "is_smart_recording", "name", "password", "ping_ms", "roi_zones", "source", "status", "use_camera_analytics", "username", "zone") SELECT "camera_type", "created_at", "driver_type", "fps", "id", "ip_address", "ip_port", "is_active", "is_chronicle", "is_smart_recording", "name", "password", "ping_ms", "roi_zones", "source", "status", "use_camera_analytics", "username", "zone" FROM "Camera";
DROP TABLE "Camera";
ALTER TABLE "new_Camera" RENAME TO "Camera";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
