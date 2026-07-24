-- CreateEnum
CREATE TYPE "VehicleRegistrationMethod" AS ENUM ('MANUAL', 'PLATE_LOOKUP');

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "version" TEXT,
    "year" INTEGER NOT NULL,
    "engine" TEXT,
    "displacement" TEXT,
    "fuel_type" TEXT,
    "transmission" TEXT,
    "traction" TEXT,
    "mileage" INTEGER,
    "vin" TEXT,
    "plate" TEXT,
    "registration_method" "VehicleRegistrationMethod" NOT NULL DEFAULT 'MANUAL',
    "data_source" TEXT,
    "data_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_vehicles_user_id_deleted_at" ON "vehicles"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_vehicles_plate" ON "vehicles"("plate");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
