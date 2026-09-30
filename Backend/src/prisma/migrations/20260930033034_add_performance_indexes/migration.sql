-- DropIndex
DROP INDEX "Submission_form_id_created_at_idx";

-- CreateIndex
CREATE INDEX "AuditLog_user_id_created_at_idx" ON "AuditLog"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "Form_project_id_created_at_idx" ON "Form"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "NotificationLog_submission_id_idx" ON "NotificationLog"("submission_id");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_expires_at_revoked_at_idx" ON "RefreshToken"("user_id", "expires_at", "revoked_at");

-- CreateIndex
CREATE INDEX "Submission_form_id_created_at_idx" ON "Submission"("form_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Submission_form_id_deleted_at_idx" ON "Submission"("form_id", "deleted_at");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_created_at_idx" ON "WebhookDelivery"("status", "created_at");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_updated_at_idx" ON "WebhookDelivery"("status", "updated_at");
