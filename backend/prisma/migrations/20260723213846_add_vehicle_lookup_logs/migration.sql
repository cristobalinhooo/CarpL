-- CreateEnum
CREATE TYPE "VehicleLookupStatus" AS ENUM ('SUCCESS', 'NOT_FOUND', 'PROVIDER_ERROR');

-- CreateTable
CREATE TABLE "vehicle_lookup_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "plate_input" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "status" "VehicleLookupStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_lookup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_vehicle_lookup_log_user_id_created_at" ON "vehicle_lookup_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "vehicle_lookup_logs" ADD CONSTRAINT "vehicle_lookup_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_lookup_logs" ADD CONSTRAINT "vehicle_lookup_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
