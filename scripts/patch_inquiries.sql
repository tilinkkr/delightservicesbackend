
-- Patch to add missing columns to inquiries table
alter table inquiries add column if not exists name text;
alter table inquiries add column if not exists subject text;
