ALTER TABLE `assessment_access` ADD `scores_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `assessment_access` ADD `primary_talent` text;--> statement-breakpoint
ALTER TABLE `assessment_access` ADD `secondary_talent` text;--> statement-breakpoint
ALTER TABLE `assessment_access` ADD `report_version` text;