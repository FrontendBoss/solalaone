/*
  # Add User Name and Company Address to User Settings

  1. Changes
    - Add `user_name` column to `user_settings` table (text, nullable)
    - Add `company_address` column to `user_settings` table (text, nullable)
  
  2. Purpose
    - Allow users to store their personal name and company address
    - These fields will be used on exported proposals and reports alongside company name and tagline
  
  3. Notes
    - Both fields are optional (nullable)
    - Uses IF NOT EXISTS to prevent errors if columns already exist
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN user_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'company_address'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN company_address text;
  END IF;
END $$;