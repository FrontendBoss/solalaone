# SolalaSolar

A comprehensive solar installation planning and proposal generation application. SolalaSolar helps solar professionals analyze properties, design solar systems, calculate costs, and generate professional proposals for clients.

## Features

- **Solar Analysis**: Integrate with Google Solar API to analyze roof suitability and solar potential
- **Auto Design**: Automatically design optimal solar panel layouts based on roof geometry
- **Load Calculator**: Calculate electrical loads and system sizing requirements
- **Cost Estimation**: Detailed cost breakdowns including equipment, installation, and incentives
- **Proposal Generation**: Create professional PDF proposals with charts and visualizations
- **Project Management**: Save and manage multiple solar projects
- **User Authentication**: Secure login and user management with Supabase
- **Subscription Management**: Credit-based system with Stripe integration
- **Marketing Charts**: Visual representations of savings, ROI, and environmental impact

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Database & Auth**: Supabase
- **Charts**: Chart.js + React-Chartjs-2
- **Maps**: Google Maps API
- **Solar Data**: Google Solar API
- **AI**: Google Gemini API
- **Payments**: Stripe
- **PDF Generation**: jsPDF + html2canvas

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

You'll also need accounts and API keys for:

- [Supabase](https://supabase.com) (free tier available)
- [Google Cloud Platform](https://console.cloud.google.com) (for Maps and Solar APIs)
- [Google AI Studio](https://makersuite.google.com/app/apikey) (for Gemini API)
- [Stripe](https://stripe.com) (for payment processing)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google APIs
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_SOLAR_API_KEY=your_google_solar_api_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
APP_URL=your_app_url
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```



### 4. Set Up Supabase Database

The project uses Supabase for data persistence and authentication. The database schema is managed through migrations located in `supabase/migrations/`.

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your_project_ref

# Push migrations
supabase db push
```

#### Option B: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each migration file in order (sorted by timestamp)

The migrations will create:
- User profiles and credit system
- Projects and proposals tables
- Price lists and incentives tables
- User settings and storage
- Row Level Security policies

### 5. Set Up Supabase Edge Functions

The project includes three edge functions for handling API requests and webhooks:

```bash
# Deploy edge functions (if using Supabase CLI)
supabase functions deploy solar-api-gateway
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

Or deploy them through the Supabase dashboard under Edge Functions.

### 6. Configure Stripe Webhooks

For payment processing to work correctly, you need to set up Stripe webhooks. Follow the detailed instructions in [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md).

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```



## Key Features Documentation

### Credit System

The application uses a credit-based system for API usage. See [CREDIT_SYSTEM_SETUP.md](./CREDIT_SYSTEM_SETUP.md) for details on:
- Credit packages and pricing
- Credit consumption rates
- Purchase and tracking

### Solar Analysis

1. Enter an address in the search bar
2. Click on the property to analyze
3. View building insights and solar potential
4. Explore data layers (monthly flux, shade analysis)
5. Design solar panel layout automatically or manually

### Proposal Generation

1. Complete the solar analysis
2. Configure system parameters (panel count, costs, incentives)
3. Review cost estimation and savings calculations
4. Generate and export professional PDF proposal

## Environment Configuration

- **Development**: Uses `.env` file
- **Production**: Configure environment variables in your hosting platform

## Troubleshooting

### Common Issues

**API Key Errors:**
- Verify all API keys are correctly set in `.env`
- Check that Google Cloud APIs are enabled
- Ensure Supabase project is active

**Database Connection Issues:**
- Verify Supabase URL and anon key
- Check that migrations have been applied
- Ensure RLS policies are correctly configured

**Stripe Webhook Failures:**
- Verify webhook secret is correct
- Check endpoint URL is accessible
- Review Stripe dashboard for webhook logs

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf .vite`
- Check Node.js version compatibility

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is proprietary and confidential.

## Support

For issues, questions, or contributions, please open an issue in the repository or contact the development team.
