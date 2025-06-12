
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Perfect for individual users and small projects",
      features: [
        "Up to 5 Excel files",
        "Basic 2D & 3D charts",
        "Standard export options",
        "Community support",
        "1GB storage"
      ],
      popular: false,
      buttonText: "Get Started Free"
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Ideal for businesses and power users",
      features: [
        "Unlimited Excel files",
        "Advanced 3D visualizations",
        "All export formats",
        "Priority support",
        "50GB storage",
        "Cloud integration",
        "Custom color schemes",
        "Advanced filtering"
      ],
      popular: true,
      buttonText: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For teams and organizations with advanced needs",
      features: [
        "Everything in Professional",
        "Unlimited storage",
        "Custom branding",
        "API access",
        "SSO integration",
        "Dedicated support",
        "Custom integrations",
        "Advanced security",
        "Team collaboration"
      ],
      popular: false,
      buttonText: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            💰 Flexible Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Choose the Perfect Plan
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> for Your Needs</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include our core analytics features 
            with varying limits and advanced capabilities.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-blue-500 shadow-2xl ring-2 ring-blue-500/20 scale-105' 
                  : 'border-gray-200 hover:shadow-xl'
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full mt-6 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I switch plans anytime?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                  and we'll prorate any billing adjustments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All paid plans come with a 14-day free trial. No credit card required to start your trial.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What file formats do you support?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We support all major Excel formats including .xlsx, .xls, and .csv files. 
                  We also support Google Sheets imports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
