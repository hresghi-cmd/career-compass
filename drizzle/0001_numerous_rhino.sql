ALTER TABLE `assessment_access` ADD `answers_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `assessment_access` ADD `progress_version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `assessment_access` ADD `updated_at` integer;