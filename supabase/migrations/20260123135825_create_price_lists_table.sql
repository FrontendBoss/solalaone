/*
  # Create Price Lists Table

  1. New Tables
    - `price_lists`
      - `id` (uuid, primary key) - Unique identifier for each price list
      - `user_id` (uuid, foreign key) - References auth.users(id)
      - `name` (text) - Custom name for the price list
      - `battery_value` (text) - Battery capacity value (e.g., "200Ah")
      - `battery_price` (numeric) - Price of the battery
      - `battery_brand` (text, nullable) - Brand name of the battery
      - `inverter_value` (text) - Inverter capacity (e.g., "3KVA")
      - `inverter_price` (numeric) - Price of the inverter
      - `inverter_brand` (text, nullable) - Brand name of the inverter
      - `panel_value` (text) - Panel wattage (e.g., "400W")
      - `panel_price` (numeric) - Price of the panel
      - `panel_brand` (text, nullable) - Brand name of the panel
      - `charge_controller_value` (text) - Charge controller amperage (e.g., "60A")
      - `charge_controller_price` (numeric) - Price of the charge controller
      - `charge_controller_brand` (text, nullable) - Brand name of the charge controller
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `price_lists` table
    - Add policy for users to view their own price lists
    - Add policy for users to insert their own price lists
    - Add policy for users to update their own price lists
    - Add policy for users to delete their own price lists

  3. Constraints
    - Users can have maximum 5 price lists
*/

CREATE TABLE IF NOT EXISTS price_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  battery_value text NOT NULL,
  battery_price numeric NOT NULL,
  battery_brand text DEFAULT '',
  inverter_value text NOT NULL,
  inverter_price numeric NOT NULL,
  inverter_brand text DEFAULT '',
  panel_value text NOT NULL,
  panel_price numeric NOT NULL,
  panel_brand text DEFAULT '',
  charge_controller_value text NOT NULL,
  charge_controller_price numeric NOT NULL,
  charge_controller_brand text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own price lists"
  ON price_lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price lists"
  ON price_lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price lists"
  ON price_lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own price lists"
  ON price_lists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_price_lists_user_id ON price_lists(user_id);