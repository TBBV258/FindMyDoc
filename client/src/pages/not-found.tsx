import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";

export default function NotFound() {
  const { t } = useLanguage();
  const [_, navigate] = useLocation();
  
  return (
    <MainLayout showNavbar={false}>
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-6">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">404 - {t('common.pageNotFound')}</h1>
              <p className="mt-2 text-sm text-gray-600">
                {t('common.pageNotFoundDesc')}
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate("/")}
                className="w-full max-w-xs"
              >
                {t('common.backToHome')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
