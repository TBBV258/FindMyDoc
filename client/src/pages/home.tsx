import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Document, storageMethods } from "@/lib/firebase";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentCard } from "@/components/documents/document-card";
import { HintBox } from "@/components/ui/hint-box";
import { PointsProgress } from "@/components/ui/points-progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language";
import { Plus, FileText, BadgeInfo, ShieldCheck, Award } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-documents");
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if this is the first visit to the app
    const hasVisitedHome = localStorage.getItem('has-visited-home');
    if (!hasVisitedHome) {
      setIsFirstVisit(true);
      localStorage.setItem('has-visited-home', 'true');
    }

    const fetchDocuments = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const docs = await storageMethods.getDocuments(user.id);
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: t('common.error'),
          description: t("common.errorLoadingDocuments"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [user, toast, t]);

  const handleAddDocument = () => {
    navigate("/add-document");
  };

  const handleViewDocument = (id: string) => {
    navigate(`/document/${id}`);
  };

  const handleEditDocument = (id: string) => {
    navigate(`/document/${id}/edit`);
  };

  const handleStatusToggle = async (id: string, currentStatus: 'active' | 'lost' | 'found') => {
    try {
      const newStatus = currentStatus === 'active' ? 'lost' : 'active';
      await storageMethods.updateDocument({ id, status: newStatus });
      
      // Update local state
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? { ...doc, status: newStatus } : doc
        )
      );
      
      toast({
        title: newStatus === 'lost' ? t("document.documentMarkedLost") : t("document.statusUpdated"),
        description: newStatus === 'lost' 
          ? t("document.documentMarkedLostDesc")
          : t("document.statusUpdatedDesc"),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t("document.errorUpdatingStatus"),
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "lost-feed") {
      navigate("/lost-feed");
    } else if (value === "found-feed") {
      navigate("/found-feed");
    }
  };

  return (
    <MainLayout>
      <div className="container px-4 mx-auto pt-4">
        <h1 className="text-2xl font-bold mb-2">
          {t('common.welcome')}{user ? `, ${user.username}!` : '!'}
        </h1>

        {isFirstVisit && (
          <HintBox 
            title={t('common.welcomeToApp')}
            hintKey="app-intro"
            className="mb-4"
          >
            <p className="mb-2">{t('common.appIntro')}</p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="card-minimalist flex flex-col items-center p-3 text-center">
                <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                <p className="text-xs font-medium">{t('common.secureStorage')}</p>
              </div>
              <div className="card-minimalist flex flex-col items-center p-3 text-center">
                <FileText className="h-6 w-6 text-primary mb-2" />
                <p className="text-xs font-medium">{t('common.reportLost')}</p>
              </div>
              <div className="card-minimalist flex flex-col items-center p-3 text-center">
                <Award className="h-6 w-6 text-primary mb-2" />
                <p className="text-xs font-medium">{t('common.earnPoints')}</p>
              </div>
            </div>
          </HintBox>
        )}
        
        <Tabs defaultValue="my-documents" value={activeTab} onValueChange={handleTabChange}>
          <div className="bg-white sticky top-[57px] z-10 border-b">
            <TabsList className="flex w-full rounded-none bg-transparent">
              <TabsTrigger 
                value="my-documents" 
                className="flex-1 text-center py-3"
              >
                {t('common.documents')}
              </TabsTrigger>
              <TabsTrigger 
                value="lost-feed" 
                className="flex-1 text-center py-3"
              >
                {t('common.documentLost')}
              </TabsTrigger>
              <TabsTrigger 
                value="found-feed" 
                className="flex-1 text-center py-3"
              >
                {t('common.documentFound')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-documents" className="py-4">
            {/* Points & Subscription Banner */}
            <div className="card-minimalist mb-6">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">{t('common.points')}</h3>
                <Badge variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {user?.points || 0} {t('common.points')}
                </Badge>
              </div>
              <PointsProgress current={user?.points || 0} total={100} />
              <p className="text-xs text-muted-foreground mt-2">
                {t('common.pointsInfo')}
              </p>
            </div>
            
            {/* Subscription Status */}
            <div className="bg-secondary/10 rounded-lg p-4 mb-6 border-l-4 border-secondary">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-secondary">{t('subscription.free')}</h3>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {t('common.current')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('subscription.idCardOnly')}</p>
                </div>
                <Button 
                  onClick={() => navigate("/subscription")}
                  variant="secondary" 
                  size="sm"
                >
                  {t('subscription.upgrade')}
                </Button>
              </div>
            </div>
            
            {/* Add Document Button */}
            <Button
              onClick={handleAddDocument}
              variant="outline"
              className="w-full card-minimalist flex items-center justify-center h-auto font-normal hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">{t('document.addNew')}</span>
            </Button>
            
            {/* Documents List */}
            <div className="flex items-center justify-between mt-6 mb-3">
              <h2 className="font-medium">{t('document.yourDocuments')}</h2>
              <Badge variant="outline" className="text-xs">
                {documents.length} {t('document.total')}
              </Badge>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('common.loading')}</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 card-minimalist">
                <div className="bg-primary/10 p-4 rounded-full inline-flex items-center justify-center mb-3">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium mb-2">{t('document.noDocuments')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('document.startAdding')}
                </p>
                <Button 
                  onClick={handleAddDocument}
                  variant="default" 
                  className="bg-primary hover:bg-primary/90"
                >
                  {t('document.addFirst')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onViewClick={handleViewDocument}
                    onEditClick={handleEditDocument}
                    onStatusToggle={handleStatusToggle}
                  />
                ))}
              </div>
            )}

            {documents.length > 0 && documents.length < 3 && (
              <HintBox 
                title={t('document.documentTip')} 
                hintKey="document-management-tip"
                className="mt-4"
              >
                {t('document.documentManagementTip')}
              </HintBox>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
