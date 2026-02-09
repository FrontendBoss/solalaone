# Hybrid Credit System Setup Guide

This application now includes a comprehensive credit system with Stripe integration for subscriptions and one-time credit purchases.

## Overview

The system implements:
- **Monthly Subscription Credits**: Recurring credits that reset each billing cycle (no rollover)
- **Purchased Credits**: One-time credits that never expire
- **Credit Priority**: Monthly credits are used first, then purchased credits
- **API Gatekeeper**: All Solar API calls require 1 credit

## System Architecture

### Database Schema
- **profiles** table: Stores user credit balance and subscription info
- **RPC Functions**:
  - `deduct_credit`: Atomically deducts credits (monthly first, then purchased)
  - `add_purchased_credits`: Adds purchased credits
  - `reset_monthly_allowance`: Resets monthly credits on subscription renewal
  - `update_subscription_info`: Updates subscription details

### Edge Functions
1. **stripe-checkout**: Creates Stripe checkout sessions for subscriptions and top-ups
2. **stripe-webhook**: Handles Stripe webhooks (invoice.paid, checkout.session.completed)
3. **solar-api-gateway**: Credit gatekeeper that deducts credits before proxying to Solar API

### Frontend Components
- **Pricing Page**: Shows subscription tiers and credit top-up packs
- **Success Page**: Post-purchase confirmation page
- **SearchBar**: Displays credits and blocks searches when balance is 0
- **HomePage**: Shows credit balance with link to pricing

## Pricing Structure

### Subscription Tiers
- **Basic**: $49/month - 120 credits/month
- **Professional**: $99/month - 250 credits/month
- **Premier**: $349/month - 1000 credits/month

### Top-Up Credit Packs
- 15 credits: $10
- 30 credits: $20
- 70 credits: $50
- 150 credits: $100

## Stripe Setup Instructions

### 1. Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers > API keys
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Configure Stripe Webhook
1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`
5. Copy the **Webhook Signing Secret** (starts with `whsec_`)

### 3. Add Secrets to Supabase
The edge functions require these environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret

Note: These secrets are automatically configured in your Supabase project.

### 4. Test the Integration
1. Use Stripe's test mode with test cards
2. Test card: `4242 4242 4242 4242`
3. Expiry: Any future date
4. CVC: Any 3 digits

## User Flow

### New User (No Subscription)
1. User signs up
2. Profile created with 0 credits
3. User sees "Get Credits" button
4. Clicks to view Pricing page
5. Selects subscription tier or top-up pack
6. Completes Stripe checkout
7. Webhook processes payment and adds credits
8. User can now perform solar assessments

### Subscribed User with Credits
1. User sees credit balance in SearchBar and HomePage
2. Can perform searches (1 credit each)
3. Credits deducted: monthly first, then purchased
4. Can buy top-up packs anytime
5. Monthly credits reset on billing cycle

### Out of Credits
1. Search button is disabled
2. Modal appears when user tries to search
3. Modal offers direct link to buy top-up packs
4. After purchase, user can immediately continue

## API Credit Usage

Each solar assessment (search) costs **1 credit** and includes:
- Google Places API (address lookup)
- Google Solar API (solar potential analysis)
- AI-powered recommendations

## Testing Checklist

- [ ] User can view credit balance
- [ ] User can purchase subscription
- [ ] User can purchase top-up credits
- [ ] Search is blocked when credits = 0
- [ ] Modal appears when out of credits
- [ ] Credits deduct correctly (monthly first)
- [ ] Monthly credits reset on renewal
- [ ] Purchased credits persist
- [ ] Webhook processes payments correctly
- [ ] Success page redirects after purchase

## Troubleshooting

### Credits not updating after purchase
- Check Supabase logs for webhook errors
- Verify webhook secret is correct
- Check Stripe webhook dashboard for delivery status

### Checkout session not creating
- Verify Stripe secret key is set correctly
- Check browser console for errors
- Ensure user is authenticated

### Search not consuming credits
- Check edge function logs
- Verify solar-api-gateway is deployed
- Test RPC function in Supabase SQL editor

## Support

For issues or questions:
1. Check Supabase edge function logs
2. Review Stripe webhook delivery logs
3. Test RPC functions directly in Supabase

## Security Notes

- All credit operations are atomic (prevent race conditions)
- RLS policies ensure users can only access their own data
- Webhook validates signature before processing
- API keys never exposed to frontend
