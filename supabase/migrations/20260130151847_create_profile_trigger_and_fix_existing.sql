/*
  # Add Profile Auto-Creation and Fix Existing Users

  1. Changes
    - Create function to automatically create profiles for new users
    - Set up trigger on auth.users to call this function
    - Create profiles for any existing users who don't have one
  
  2. Security
    - Function uses SECURITY DEFINER to access auth schema
    - Trigger ensures every user gets a profile automatically
*/

-- Function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, monthly_allowance, purchased_credits, created_at, updated_at)
  VALUES (
    NEW.id,
    0,
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, do nothing
    RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for any existing users who don't have one
INSERT INTO public.profiles (id, monthly_allowance, purchased_credits, created_at, updated_at)
SELECT 
  id,
  0,
  0,
  NOW(),
  NOW()
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;
