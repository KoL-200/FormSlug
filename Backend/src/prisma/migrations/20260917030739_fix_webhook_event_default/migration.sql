-- AlterTable
ALTER TABLE "WebhookEndpoint" ALTER COLUMN "events" SET DEFAULT ARRAY['submitted.created']::TEXT[];
