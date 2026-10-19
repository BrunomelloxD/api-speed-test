-- speed_tests was created outside migrate in existing environments (db push),
-- so this migration is idempotent: it only creates what is missing.

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."speed_tests" (
    "id" TEXT NOT NULL,
    "download_speed" DOUBLE PRECISION NOT NULL,
    "upload_speed" DOUBLE PRECISION NOT NULL,
    "ping" DOUBLE PRECISION NOT NULL,
    "jitter" DOUBLE PRECISION,
    "ip_address" TEXT,
    "isp" TEXT,
    "server_location" TEXT,
    "tested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speed_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "speed_tests_tested_at_idx" ON "public"."speed_tests"("tested_at");
