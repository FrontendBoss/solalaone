/*
  # Add Company Name and Tagline to User Settings

  1. Changes
    - Add `company_name` column to `user_settings` table (text, nullable)
    - Add `company_tagline` column to `user_settings` table (text, nullable)
  
  2. Purpose
    - Allow users to store their company name and tagline/motto
    - These fields will be used on exported proposals and reports
  
  3. Notes
    - Both fields are optional (nullable)
    - Uses IF NOT EXISTS to prevent errors if columns already exist
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN company_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'company_tagline'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN company_tagline text;
  END IF;
END $$;