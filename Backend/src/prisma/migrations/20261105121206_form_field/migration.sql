-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'EMAIL', 'SELECT', 'CHECKBOX');

-- CreateTable
CREATE TABLE "FormField" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "FormFieldType" NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "placeholder" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormField_form_id_position_idx" ON "FormField"("form_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "FormField_form_id_key_key" ON "FormField"("form_id", "key");

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
