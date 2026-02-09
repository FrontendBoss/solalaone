export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'subscription' | 'payment';
  features: string[];
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_Tt5C4iY9RqjbAw',
    priceId: 'price_1SvJ1pGdB8IZFwDz9CRzXImp',
    name: 'Basic',
    description: 'Perfect for small solar installers getting started',
    price: 49.99,
    currency: 'usd',
    mode: 'subscription',
    features: [
      '50 proposals per month',
      'Basic solar calculator',
      'PDF export',
      'Email support'
    ]
  },
  {
    id: 'prod_Tt5Cw7cmK61QM4',
    priceId: 'price_1SvJ2NGdB8IZFwDzNW2ftObZ',
    name: 'Professional',
    description: 'Advanced features for growing solar businesses',
    price: 99.00,
    currency: 'usd',
    mode: 'subscription',
    features: [
      '200 proposals per month',
      'Advanced solar calculator',
      'Custom branding',
      'PDF & Excel export',
      'Priority support',
      'Solar irradiance mapping'
    ]
  },
  {
    id: 'prod_Tt5DOZ1p7HpaIx',
    priceId: 'price_1SvJ2jGdB8IZFwDzoYPPADSm',
    name: 'Premier',
    description: 'Complete solution for enterprise solar installers',
    price: 349.00,
    currency: 'usd',
    mode: 'subscription',
    features: [
      'Unlimited proposals',
      'Full solar calculator suite',
      'White-label branding',
      'All export formats',
      'Dedicated support',
      'Advanced analytics',
      'API access',
      'Custom integrations'
    ]
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};