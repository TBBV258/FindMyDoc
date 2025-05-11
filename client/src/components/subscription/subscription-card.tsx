import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { subscribeToPlan } from "@/lib/subscription";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  frequency: string;
  description: string;
  features: string[];
  discount?: string;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isActive: boolean;
  isBestValue?: boolean;
  onSuccess?: () => void;
}

export function SubscriptionCard({ plan, isActive, isBestValue = false, onSuccess }: SubscriptionCardProps) {
  const { user, isDemo } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive",
      });
      return;
    }

    if (isDemo) {
      toast({
        title: "Demo Restriction",
        description: "Subscription changes are disabled in demo mode",
        variant: "destructive",
      });
      return;
    }

    if (isActive) {
      toast({
        title: "Already Subscribed",
        description: "You are already subscribed to this plan",
      });
      return;
    }

    setIsLoading(true);
    try {
      await subscribeToPlan(user.id, plan.id);
      toast({
        title: "Subscription Updated",
        description: `You have successfully subscribed to the ${plan.name}`,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "There was an error updating your subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (plan.id === "free") {
    return (
      <div className="bg-background rounded-lg p-4 mb-4 border-l-4 border-secondary">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-roboto font-medium text-secondary">{plan.name}</h3>
            <p className="text-xs text-darkGray">{plan.description}</p>
          </div>
          {isActive && (
            <div className="bg-secondary text-white text-xs font-medium px-2 py-1 rounded">Active</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border ${
        isBestValue ? "border-2 border-primary" : "border-lightGray"
      } rounded-lg p-4 hover:border-primary transition cursor-pointer relative ${
        plan.id === "monthly" ? "mb-4" : ""
      }`}
    >
      {plan.id === "monthly" && (
        <div className="absolute top-0 right-0 border-l border-b border-lightGray rounded-bl-lg px-2 py-1 bg-background">
          <span className="text-xs font-medium text-darkGray">Monthly</span>
        </div>
      )}

      {plan.id === "yearly" && plan.discount && (
        <div className="absolute top-0 right-0 bg-warning text-white px-2 py-1 rounded-bl-lg text-xs font-medium">
          Save {plan.discount}
        </div>
      )}

      {isBestValue && (
        <div className="absolute -top-3 left-4 bg-white px-2">
          <span className="text-xs font-medium text-primary">Best Value</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-roboto font-medium">{plan.name}</h3>
          <p className="text-xs text-darkGray">{plan.description}</p>
        </div>
        <div>
          <span className="font-bold text-xl">${plan.price}</span>
          <span className="text-xs text-darkGray">/{plan.frequency}</span>
        </div>
      </div>

      <ul className="text-sm space-y-2 mb-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <i className="ri-check-line text-primary mr-2"></i>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant={isBestValue ? "default" : "outline"}
        onClick={handleSelectPlan}
        disabled={isLoading || isActive}
        className={`w-full ${
          isBestValue
            ? "bg-primary text-white hover:bg-primary/90"
            : "border-primary text-primary hover:bg-primary/5"
        } py-2 rounded-lg font-medium transition`}
      >
        {isLoading
          ? "Processing..."
          : isActive
          ? "Current Plan"
          : "Select Plan"}
      </Button>
    </div>
  );
}
