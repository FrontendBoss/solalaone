# Stripe Webhook Setup

Your Stripe checkout is working, but the webhook that processes payments needs to be configured.

## Your Webhook URL

Your Stripe webhook endpoint URL is:
```
https://[YOUR_PROJECT_REF].supabase.co/functions/v1/stripe-webhook
```

To find your exact URL:
1. Go to your Supabase project dashboard
2. Your project URL is in the API settings (format: `https://xxxxx.supabase.co`)
3. Your webhook URL is: `https://xxxxx.supabase.co/functions/v1/stripe-webhook`

## Setup Steps

1. **Go to Stripe Dashboard**
   - Visit https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"

2. **Configure the Endpoint**
   - Endpoint URL: Your webhook URL from above
   - Events to send: Select these events:
     - `checkout.session.completed`
     - `invoice.paid`
     - `customer.subscription.deleted`

3. **Get the Signing Secret**
   - After creating the webhook, click on it
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_`)

4. **Add Secret to Supabase**
   - This is automatically configured for you
   - The secret should be set as `STRIPE_WEBHOOK_SECRET` environment variable

## Testing

After setup, you can test by:
1. Making a test payment
2. Checking your credits update automatically
3. Viewing webhook events in Stripe dashboard

## Webhook Events

The webhook handles:
- **checkout.session.completed**: Credits or subscription when payment succeeds
- **invoice.paid**: Monthly subscription renewals
- **customer.subscription.deleted**: Cancellation handling
