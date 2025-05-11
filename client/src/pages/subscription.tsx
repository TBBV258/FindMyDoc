import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { MainLayout } from "@/components/layout/main-layout";
import { subscriptionPlans } from "@/lib/utils";
import { SubscriptionCard } from "@/components/subscription/subscription-card";
import { getSubscriptionDetails } from "@/lib/subscription";

export default function Subscription() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  useEffect(() => {
    if (user) {
      setCurrentPlan(user.subscriptionPlan);
      setIsLoading(false);
    }
  }, [user]);

  const handleSubscriptionSuccess = () => {
    // Refresh user data or app state as needed
    if (user) {
      setCurrentPlan(user.subscriptionPlan);
    }
  };

  return (
    <MainLayout 
      title="Subscription Plans" 
      showBackButton
      showBottomNav={false}
    >
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="mb-4 text-center">
            <div className="inline-block bg-primary/10 p-3 rounded-full mb-2">
              <i className="ri-shield-star-line text-3xl text-primary"></i>
            </div>
            <h2 className="font-roboto font-bold text-xl">Choose Your Plan</h2>
            <p className="text-darkGray text-sm">Protect all your important documents</p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-darkGray">Loading subscription plans...</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {subscriptionPlans.map((plan) => (
                <SubscriptionCard
                  key={plan.id}
                  plan={plan}
                  isActive={currentPlan === plan.id}
                  isBestValue={plan.id === 'yearly'}
                  onSuccess={handleSubscriptionSuccess}
                />
              ))}
            </div>
          )}
          
          <p className="text-xs text-center text-darkGray">
            You can cancel your subscription at any time.<br />
            Payment processed securely through M-Pesa or Credit Card.
          </p>
        </div>
        
        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="font-medium text-lg mb-3">Frequently Asked Questions</h3>
          
          <div className="space-y-3">
            <div className="border-b border-lightGray pb-3">
              <h4 className="font-medium mb-1">What's included in the free plan?</h4>
              <p className="text-sm text-darkGray">The free plan allows you to store and manage your ID cards only. Premium features like storing passports or driver's licenses require a paid subscription.</p>
            </div>
            
            <div className="border-b border-lightGray pb-3">
              <h4 className="font-medium mb-1">Can I cancel my subscription?</h4>
              <p className="text-sm text-darkGray">Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
            </div>
            
            <div className="border-b border-lightGray pb-3">
              <h4 className="font-medium mb-1">What happens to my documents if I downgrade?</h4>
              <p className="text-sm text-darkGray">If you downgrade to the free plan, you'll still be able to view your premium documents, but you won't be able to add new ones or update existing premium documents.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">What payment methods are accepted?</h4>
              <p className="text-sm text-darkGray">We accept M-Pesa, credit cards, and bank transfers for payments in Mozambique.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
