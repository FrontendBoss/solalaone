/*
  # Create Profiles Table and Credit System

  ## 1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `monthly_allowance` (int, default 0) - Monthly subscription credits
      - `purchased_credits` (int, default 0) - One-time purchased credits
      - `subscription_tier` (text, nullable) - Subscription tier (basic, professional, premier)
      - `stripe_customer_id` (text, nullable) - Stripe customer ID
      - `stripe_subscription_id` (text, nullable) - Stripe subscription ID
      - `last_refill_date` (timestamptz, nullable) - Last time monthly credits were refilled
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  ## 2. RPC Functions
    - `deduct_credit(user_id uuid)` - Atomically deducts 1 credit, prioritizing monthly_allowance
      Returns boolean indicating success

  ## 3. Security
    - Enable RLS on `profiles` table
    - Users can read their own profile
    - Only authenticated users can access their profile
    - RPC function handles credit deduction securely

  ## 4. Important Notes
    - Monthly credits are used first (free/subscription credits)
    - Purchased credits are used only when monthly credits are exhausted
    - No rollover: monthly_allowance is reset on subscription renewal
    - All credit operations are atomic to prevent race conditions
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_allowance int DEFAULT 0 NOT NULL,
  purchased_credits int DEFAULT 0 NOT NULL,
  subscription_tier text,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text,
  last_refill_date timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, monthly_allowance, purchased_credits)
  VALUES (new.id, 0, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create atomic credit deduction function
CREATE OR REPLACE FUNCTION public.deduct_credit(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
  rows_affected int;
BEGIN
  -- Attempt to deduct credit with priority: monthly_allowance first, then purchased_credits
  UPDATE profiles 
  SET 
    monthly_allowance = CASE 
      WHEN monthly_allowance > 0 THEN monthly_allowance - 1 
      ELSE monthly_allowance 
    END,
    purchased_credits = CASE 
      WHEN monthly_allowance = 0 AND purchased_credits > 0 THEN purchased_credits - 1 
      ELSE purchased_credits 
    END,
    updated_at = now()
  WHERE id = target_user_id 
    AND (monthly_allowance > 0 OR purchased_credits > 0);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  -- Return true if a credit was deducted, false otherwise
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add purchased credits
CREATE OR REPLACE FUNCTION public.add_purchased_credits(target_user_id uuid, credits_to_add int)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    purchased_credits = purchased_credits + credits_to_add,
    updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset monthly allowance (for subscription renewals)
CREATE OR REPLACE FUNCTION public.reset_monthly_allowance(target_user_id uuid, new_allowance int)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    monthly_allowance = new_allowance,
    last_refill_date = now(),
    updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update subscription info
CREATE OR REPLACE FUNCTION public.update_subscription_info(
  target_user_id uuid, 
  tier text, 
  customer_id text, 
  subscription_id text,
  initial_credits int
)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    subscription_tier = tier,
    stripe_customer_id = customer_id,
    stripe_subscription_id = subscription_id,
    monthly_allowance = initial_credits,
    last_refill_date = now(),
    updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;