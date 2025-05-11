import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";
import { LanguageProvider } from "./lib/language";
import { FeatureTour } from "@/components/ui/feature-tour";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Home from "@/pages/home";
import LostFeed from "@/pages/lost-feed";
import FoundFeed from "@/pages/found-feed";
import Chat from "@/pages/chat";
import ChatDetail from "@/pages/chat-detail";
import Subscription from "@/pages/subscription";
import Profile from "@/pages/profile";
import DocumentDetail from "@/pages/document-detail";
import AddDocument from "@/pages/add-document";
import Splash from "@/pages/splash";

function App() {
  const [location] = useLocation();
  const [showTour, setShowTour] = useState(false);
  
  // Show the feature tour only when user navigates to Home after login
  useEffect(() => {
    if (location === '/home') {
      // Check if user has seen the tour before
      const hasSeenTour = localStorage.getItem('has-seen-feature-tour');
      if (!hasSeenTour) {
        // Short delay to show the tour
        const timer = setTimeout(() => {
          setShowTour(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-lg">
              <Switch>
                <Route path="/" component={Splash} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/home" component={Home} />
                <Route path="/lost-feed" component={LostFeed} />
                <Route path="/found-feed" component={FoundFeed} />
                <Route path="/chat" component={Chat} />
                <Route path="/chat/:id" component={ChatDetail} />
                <Route path="/subscription" component={Subscription} />
                <Route path="/profile" component={Profile} />
                <Route path="/document/:id" component={DocumentDetail} />
                <Route path="/add-document" component={AddDocument} />
                <Route component={NotFound} />
              </Switch>
            </div>
            {showTour && <FeatureTour />}
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
