-- AlterTable
ALTER TABLE "WebhookEndpoint" ALTER COLUMN "events" SET DEFAULT ARRAY['submission.created']::TEXT[];
