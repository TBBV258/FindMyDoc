import { User, storageMethods } from "./firebase";
import { subscriptionPlans } from "./utils";

export interface SubscriptionDetails {
  plan: typeof subscriptionPlans[number];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'canceled';
}

export async function subscribeToPlan(userId: string, planId: string): Promise<User> {
  // In a real app, this would integrate with a payment gateway
  const plan = subscriptionPlans.find(p => p.id === planId);
  if (!plan) {
    throw new Error('Invalid plan selected');
  }

  // Calculate end date based on plan frequency
  const startDate = new Date();
  const endDate = new Date(startDate);
  
  if (planId === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (planId === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Update user subscription in database
  return storageMethods.updateUser(userId, {
    subscriptionPlan: planId as 'free' | 'monthly' | 'yearly',
    subscriptionEndDate: endDate
  });
}

export function cancelSubscription(userId: string): Promise<User> {
  // In a real app, this would cancel the subscription with the payment provider
  // but keep it active until the end date
  return storageMethods.updateUser(userId, {
    subscriptionPlan: 'free'
  });
}

export function getSubscriptionDetails(user: User): SubscriptionDetails | null {
  if (!user || user.subscriptionPlan === 'free') {
    return null;
  }

  const plan = subscriptionPlans.find(p => p.id === user.subscriptionPlan);
  if (!plan) {
    return null;
  }

  const startDate = user.subscriptionEndDate 
    ? new Date(user.subscriptionEndDate)
    : new Date();
    
  let endDate = new Date(startDate);
  if (user.subscriptionPlan === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (user.subscriptionPlan === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const now = new Date();
  const status = now > endDate ? 'expired' : 'active';

  return {
    plan,
    startDate,
    endDate,
    status
  };
}

export function canUploadPremiumDocument(user: User): boolean {
  if (!user) return false;
  
  if (user.subscriptionPlan === 'free') {
    return false;
  }
  
  const now = new Date();
  if (user.subscriptionEndDate && now > new Date(user.subscriptionEndDate)) {
    return false;
  }
  
  return true;
}
