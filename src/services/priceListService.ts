import { supabase } from '../lib/supabase';

export interface PriceList {
  id: string;
  user_id: string;
  name: string;
  battery_value: string;
  battery_price: number;
  battery_brand: string;
  inverter_value: string;
  inverter_price: number;
  inverter_brand: string;
  panel_value: string;
  panel_price: number;
  panel_brand: string;
  charge_controller_value: string;
  charge_controller_price: number;
  charge_controller_brand: string;
  created_at: string;
  updated_at: string;
}

export interface PriceListInput {
  name: string;
  battery_value: string;
  battery_price: number;
  battery_brand?: string;
  inverter_value: string;
  inverter_price: number;
  inverter_brand?: string;
  panel_value: string;
  panel_price: number;
  panel_brand?: string;
  charge_controller_value: string;
  charge_controller_price: number;
  charge_controller_brand?: string;
}

export async function getUserPriceLists(): Promise<PriceList[]> {
  const { data, error } = await supabase
    .from('price_lists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching price lists:', error);
    throw error;
  }

  return data || [];
}

export async function createPriceList(input: PriceListInput): Promise<PriceList> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const existingLists = await getUserPriceLists();
  if (existingLists.length >= 5) {
    throw new Error('Maximum of 5 price lists allowed');
  }

  const { data, error } = await supabase
    .from('price_lists')
    .insert({
      user_id: user.id,
      ...input,
      battery_brand: input.battery_brand || '',
      inverter_brand: input.inverter_brand || '',
      panel_brand: input.panel_brand || '',
      charge_controller_brand: input.charge_controller_brand || '',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating price list:', error);
    throw error;
  }

  return data;
}

export async function updatePriceList(id: string, input: PriceListInput): Promise<PriceList> {
  const { data, error } = await supabase
    .from('price_lists')
    .update({
      ...input,
      battery_brand: input.battery_brand || '',
      inverter_brand: input.inverter_brand || '',
      panel_brand: input.panel_brand || '',
      charge_controller_brand: input.charge_controller_brand || '',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating price list:', error);
    throw error;
  }

  return data;
}

export async function deletePriceList(id: string): Promise<void> {
  const { error } = await supabase
    .from('price_lists')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting price list:', error);
    throw error;
  }
}
