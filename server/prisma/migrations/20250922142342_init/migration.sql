-- CreateEnum
CREATE TYPE "public"."FloodRiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'EXTREME');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('WARNING', 'WATCH', 'ADVISORY');

-- CreateEnum
CREATE TYPE "public"."Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EXTREME');

-- CreateEnum
CREATE TYPE "public"."SensorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR');

-- CreateTable
CREATE TABLE "public"."flood_characteristics" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "maximum_depth" DOUBLE PRECISION NOT NULL,
    "maximum_depth_uncertainty" DOUBLE PRECISION NOT NULL,
    "peak_velocity" DOUBLE PRECISION NOT NULL,
    "peak_velocity_uncertainty" DOUBLE PRECISION NOT NULL,
    "arrival_time" DOUBLE PRECISION NOT NULL,
    "arrival_time_uncertainty" DOUBLE PRECISION NOT NULL,
    "inundation_area" DOUBLE PRECISION NOT NULL,
    "inundation_area_uncertainty" DOUBLE PRECISION NOT NULL,
    "flood_risk_level" "public"."FloodRiskLevel" NOT NULL DEFAULT 'LOW',
    "model_version" TEXT NOT NULL DEFAULT 'v1.0',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expert_analysis" TEXT,
    "recommended_actions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flood_characteristics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weather_data" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "wind_speed" DOUBLE PRECISION NOT NULL,
    "wind_direction" TEXT NOT NULL,
    "precipitation" DOUBLE PRECISION NOT NULL,
    "pressure" DOUBLE PRECISION NOT NULL,
    "visibility" DOUBLE PRECISION NOT NULL,
    "uv_index" DOUBLE PRECISION NOT NULL,
    "condition" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weather_alerts" (
    "id" TEXT NOT NULL,
    "type" "public"."AlertType" NOT NULL,
    "severity" "public"."Severity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sensors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "public"."SensorStatus" NOT NULL DEFAULT 'ACTIVE',
    "readings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flood_characteristics_location_idx" ON "public"."flood_characteristics"("location");

-- CreateIndex
CREATE INDEX "flood_characteristics_flood_risk_level_idx" ON "public"."flood_characteristics"("flood_risk_level");

-- CreateIndex
CREATE INDEX "flood_characteristics_is_active_idx" ON "public"."flood_characteristics"("is_active");

-- CreateIndex
CREATE INDEX "weather_data_location_idx" ON "public"."weather_data"("location");

-- CreateIndex
CREATE INDEX "weather_data_timestamp_idx" ON "public"."weather_data"("timestamp");

-- CreateIndex
CREATE INDEX "weather_alerts_location_idx" ON "public"."weather_alerts"("location");

-- CreateIndex
CREATE INDEX "weather_alerts_is_active_idx" ON "public"."weather_alerts"("is_active");

-- CreateIndex
CREATE INDEX "sensors_barangay_idx" ON "public"."sensors"("barangay");

-- CreateIndex
CREATE INDEX "sensors_status_idx" ON "public"."sensors"("status");
