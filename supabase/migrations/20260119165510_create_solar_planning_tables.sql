/*
  # Solar Planning Pro Database Schema

  ## Overview
  This migration creates the complete database schema for the Solar Planning Pro application,
  including installer authentication, proposals, and branding management.

  ## New Tables
  
  ### `installers`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique, not null)
  - `company_name` (text, not null)
  - `full_name` (text, not null)
  - `phone` (text)
  - `address` (text)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `installer_branding`
  - `id` (uuid, primary key)
  - `installer_id` (uuid, references installers, not null)
  - `logo_url` (text)
  - `primary_color` (text, default '#2563eb')
  - `secondary_color` (text, default '#1e40af')
  - `company_tagline` (text)
  - `website` (text)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `proposals`
  - `id` (uuid, primary key)
  - `installer_id` (uuid, references installers, not null)
  - `client_name` (text, not null)
  - `client_email` (text)
  - `client_phone` (text)
  - `proposal_type` (text, check: 'calculator', 'cost', 'budget')
  - `proposal_data` (jsonb, not null)
  - `system_size` (numeric)
  - `total_cost` (numeric)
  - `status` (text, default 'draft', check: 'draft', 'sent', 'accepted', 'rejected')
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ## Security
  - Enable RLS on all tables
  - Installers can only access their own data
  - Authenticated users required for all operations
*/

-- Create installers table
CREATE TABLE IF NOT EXISTS installers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  company_name text NOT NULL,
  full_name text NOT NULL,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create installer_branding table
CREATE TABLE IF NOT EXISTS installer_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  logo_url text,
  primary_color text DEFAULT '#2563eb',
  secondary_color text DEFAULT '#1e40af',
  company_tagline text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(installer_id)
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  proposal_type text NOT NULL CHECK (proposal_type IN ('calculator', 'cost', 'budget')),
  proposal_data jsonb NOT NULL,
  system_size numeric,
  total_cost numeric,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Installers policies
CREATE POLICY "Users can view own installer profile"
  ON installers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own installer profile"
  ON installers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own installer profile"
  ON installers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Installer branding policies
CREATE POLICY "Users can view own branding"
  ON installer_branding FOR SELECT
  TO authenticated
  USING (installer_id = auth.uid());

CREATE POLICY "Users can insert own branding"
  ON installer_branding FOR INSERT
  TO authenticated
  WITH CHECK (installer_id = auth.uid());

CREATE POLICY "Users can update own branding"
  ON installer_branding FOR UPDATE
  TO authenticated
  USING (installer_id = auth.uid())
  WITH CHECK (installer_id = auth.uid());

CREATE POLICY "Users can delete own branding"
  ON installer_branding FOR DELETE
  TO authenticated
  USING (installer_id = auth.uid());

-- Proposals policies
CREATE POLICY "Users can view own proposals"
  ON proposals FOR SELECT
  TO authenticated
  USING (installer_id = auth.uid());

CREATE POLICY "Users can insert own proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (installer_id = auth.uid());

CREATE POLICY "Users can update own proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (installer_id = auth.uid())
  WITH CHECK (installer_id = auth.uid());

CREATE POLICY "Users can delete own proposals"
  ON proposals FOR DELETE
  TO authenticated
  USING (installer_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proposals_installer_id ON proposals(installer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_installer_branding_installer_id ON installer_branding(installer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_installers_updated_at ON installers;
CREATE TRIGGER update_installers_updated_at
  BEFORE UPDATE ON installers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_installer_branding_updated_at ON installer_branding;
CREATE TRIGGER update_installer_branding_updated_at
  BEFORE UPDATE ON installer_branding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
