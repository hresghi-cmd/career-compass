CREATE TABLE `assessment_access` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`status` text DEFAULT 'unused' NOT NULL,
	`created_at` integer NOT NULL,
	`first_opened_at` integer,
	`completed_at` integer,
	`revoked_at` integer,
	`order_reference` text,
	`merchant_note` text,
	`current_question` integer DEFAULT 0 NOT NULL,
	`created_by` text DEFAULT 'merchant' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_access_token_hash_unique` ON `assessment_access` (`token_hash`);