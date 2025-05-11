import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { storageMethods } from "@/lib/firebase";
import { getSubscriptionDetails } from "@/lib/subscription";
import { formatDate } from "@/lib/utils";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, logout, isDemo } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [_, navigate] = useLocation();
  
  const subscriptionDetails = user ? getSubscriptionDetails(user) : null;
  
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubscriptionNavigation = () => {
    navigate("/subscription");
  };

  return (
    <MainLayout title="Profile" hasNotifications>
      <div className="p-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-lightGray flex items-center justify-center mr-4">
              <span className="text-2xl font-medium">
                {user?.username?.substring(0, 2).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-medium">{user?.username || "User"}</h2>
              <p className="text-sm text-darkGray">{user?.email || "user@example.com"}</p>
              <p className="text-sm text-darkGray">{user?.phoneNumber || "+258 00 000 0000"}</p>
            </div>
          </div>
          
          {isDemo && (
            <div className="bg-warning/10 p-3 rounded-lg border-l-4 border-warning mb-4">
              <p className="text-sm text-warning font-medium">
                Demo Account
              </p>
              <p className="text-xs text-darkGray">
                This is a demo account with limited features. Sign up for full access.
              </p>
            </div>
          )}
          
          <Button
            onClick={() => navigate("/edit-profile")}
            variant="outline"
            className="w-full"
          >
            <i className="ri-edit-line mr-2"></i> Edit Profile
          </Button>
        </div>
        
        {/* Activity Points */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg">Activity Points</h3>
            <div className="bg-primary/10 p-2 rounded-full">
              <i className="ri-award-line text-xl text-primary"></i>
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold text-primary">{user?.points || 0}</span>
            <span className="text-sm text-darkGray ml-2">/ 100</span>
          </div>
          
          <div className="w-full bg-lightGray rounded-full h-2 mb-2">
            <div 
              className="points-progress" 
              style={{ width: `${Math.min(((user?.points || 0) / 100) * 100, 100)}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-darkGray">
            {user && user.points >= 100 
              ? "You've earned a free document verification!"
              : `Earn ${100 - (user?.points || 0)} more points for a free document verification.`}
          </p>
          
          <Separator className="my-4" />
          
          <h4 className="font-medium mb-2">How to earn points:</h4>
          <ul className="text-sm text-darkGray space-y-1">
            <li className="flex items-center">
              <i className="ri-checkbox-circle-line text-primary mr-2"></i>
              Report a found document: +20 points
            </li>
            <li className="flex items-center">
              <i className="ri-checkbox-circle-line text-primary mr-2"></i>
              Successfully return a document: +50 points
            </li>
            <li className="flex items-center">
              <i className="ri-checkbox-circle-line text-primary mr-2"></i>
              Daily app usage: +5 points
            </li>
          </ul>
        </div>
        
        {/* Subscription */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg">Your Subscription</h3>
            <div className="bg-secondary/10 p-2 rounded-full">
              <i className="ri-vip-crown-line text-xl text-secondary"></i>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="font-medium">
              {user?.subscriptionPlan === 'free' 
                ? 'Free Plan'
                : user?.subscriptionPlan === 'monthly'
                ? 'Monthly Premium Plan'
                : 'Annual Premium Plan'}
            </p>
            
            {subscriptionDetails && (
              <p className="text-sm text-darkGray">
                Expires on: {formatDate(subscriptionDetails.endDate)}
              </p>
            )}
            
            {user?.subscriptionPlan === 'free' && (
              <p className="text-sm text-darkGray">
                Limited to ID cards only
              </p>
            )}
          </div>
          
          <Button
            onClick={handleSubscriptionNavigation}
            variant={user?.subscriptionPlan === 'free' ? 'default' : 'outline'}
            className={user?.subscriptionPlan === 'free' ? 'w-full bg-secondary hover:bg-secondary/90' : 'w-full'}
          >
            {user?.subscriptionPlan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
          </Button>
        </div>
        
        {/* Settings */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <h3 className="font-medium text-lg mb-3">Settings</h3>
          
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-2 hover:bg-background rounded-lg">
              <div className="flex items-center">
                <i className="ri-notification-2-line mr-3 text-lg text-darkGray"></i>
                <span>Notifications</span>
              </div>
              <i className="ri-arrow-right-s-line text-darkGray"></i>
            </button>
            
            <button className="w-full flex items-center justify-between p-2 hover:bg-background rounded-lg">
              <div className="flex items-center">
                <i className="ri-lock-line mr-3 text-lg text-darkGray"></i>
                <span>Privacy & Security</span>
              </div>
              <i className="ri-arrow-right-s-line text-darkGray"></i>
            </button>
            
            <button className="w-full flex items-center justify-between p-2 hover:bg-background rounded-lg">
              <div className="flex items-center">
                <i className="ri-question-line mr-3 text-lg text-darkGray"></i>
                <span>Help & Support</span>
              </div>
              <i className="ri-arrow-right-s-line text-darkGray"></i>
            </button>
            
            <button className="w-full flex items-center justify-between p-2 hover:bg-background rounded-lg">
              <div className="flex items-center">
                <i className="ri-information-line mr-3 text-lg text-darkGray"></i>
                <span>About Find My Document</span>
              </div>
              <i className="ri-arrow-right-s-line text-darkGray"></i>
            </button>
          </div>
        </div>
        
        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full mb-6"
          disabled={isLoading}
        >
          {isLoading ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    </MainLayout>
  );
}
