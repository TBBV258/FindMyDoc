import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | number | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (date: Date | number | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const maskText = (text: string, visibleChars: number = 3): string => {
  if (!text || text.length <= visibleChars) return text;
  const visible = text.slice(0, visibleChars);
  const masked = '*'.repeat(Math.min(text.length - visibleChars, 3));
  return `${visible}${masked}`;
};

export const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);
};

export const documentTypes = [
  'ID Card',
  'Driver\'s License',
  'Passport',
  'Bank Card'
];

export const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    frequency: 'free',
    description: 'Limited to ID cards only',
    features: ['ID card storage only', 'Basic lost document alerts', 'Limited chat functionality']
  },
  {
    id: 'monthly',
    name: 'Premium Plan',
    price: 1.5,
    frequency: 'month',
    description: 'Full access to all features',
    features: ['Unlimited document storage', 'Priority lost document alerts', 'Direct chat with document finders']
  },
  {
    id: 'yearly',
    name: 'Annual Plan',
    price: 10,
    frequency: 'year',
    description: 'Full access at a discount',
    features: ['All Premium Plan features', 'Bonus 100 reward points', 'Enhanced document security'],
    discount: '33%'
  }
];
