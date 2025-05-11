import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { LostDocument, storageMethods } from "@/lib/firebase";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentSearch } from "@/components/lost-found/document-search";
import { LostDocumentCard } from "@/components/lost-found/lost-document-card";
import { ReportLostDocumentForm } from "@/components/documents/report-lost-document-form";
import { Button } from "@/components/ui/button";
import { HintBox } from "@/components/ui/hint-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language";
import { ScrollText, PlusCircle, ArrowDown, MapPin, Search } from "lucide-react";

export default function LostFeed() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [lostDocuments, setLostDocuments] = useState<LostDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<LostDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("lost-feed");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if this is the first visit to the lost feed
    const hasVisitedLostFeed = localStorage.getItem('has-visited-lost-feed');
    if (!hasVisitedLostFeed) {
      setIsFirstVisit(true);
      localStorage.setItem('has-visited-lost-feed', 'true');
    }

    const fetchLostDocuments = async () => {
      setIsLoading(true);
      try {
        const docs = await storageMethods.getLostDocuments();
        setLostDocuments(docs);
        setFilteredDocuments(docs);
      } catch (error) {
        console.error("Error fetching lost documents:", error);
        toast({
          title: t('common.error'),
          description: t('document.errorLoadingLost'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLostDocuments();
  }, [toast, t]);

  const handleSearch = (filters: { query: string; type: string; location: string }) => {
    let filtered = [...lostDocuments];
    
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.document.name.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          (doc.lostLocation && doc.lostLocation.toLowerCase().includes(query))
      );
    }
    
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((doc) => doc.document.type === filters.type);
    }
    
    if (filters.location) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(
        (doc) => doc.lostLocation && doc.lostLocation.toLowerCase().includes(location)
      );
    }
    
    setFilteredDocuments(filtered);
  };

  const handleContactClick = (userId: string, documentId: string) => {
    // In a real app, this would create a conversation if it doesn't exist
    // and then navigate to the chat
    navigate(`/chat/${userId}`);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "my-documents") {
      navigate("/home");
    } else if (value === "found-feed") {
      navigate("/found-feed");
    }
  };

  const handleReportSuccess = () => {
    setReportDialogOpen(false);
    // Refetch the lost documents
    const fetchLostDocuments = async () => {
      try {
        const docs = await storageMethods.getLostDocuments();
        setLostDocuments(docs);
        setFilteredDocuments(docs);
      } catch (error) {
        console.error("Error refetching lost documents:", error);
      }
    };
    fetchLostDocuments();
  };

  return (
    <MainLayout>
      <div className="container px-4 mx-auto pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('document.lostFeedTitle')}</h1>
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                {t('document.reportLost')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg w-[calc(100%-2rem)]">
              <ReportLostDocumentForm 
                onSuccess={handleReportSuccess}
                onCancel={() => setReportDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isFirstVisit && (
          <HintBox 
            title={t('document.welcomeToLostFeed')}
            hintKey="lost-feed-intro"
            className="mb-4"
          >
            <div className="space-y-2">
              <p>{t('document.lostFeedIntro')}</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex flex-col items-center text-xs text-center">
                  <Search className="h-5 w-5 text-primary mb-1" />
                  <span>{t('document.findStep')}</span>
                </div>
                <div className="flex flex-col items-center text-xs text-center">
                  <MapPin className="h-5 w-5 text-primary mb-1" />
                  <span>{t('document.locateStep')}</span>
                </div>
                <div className="flex flex-col items-center text-xs text-center">
                  <ArrowDown className="h-5 w-5 text-primary mb-1" />
                  <span>{t('document.contactStep')}</span>
                </div>
              </div>
            </div>
          </HintBox>
        )}

        <Tabs defaultValue="lost-feed" value={activeTab} onValueChange={handleTabChange}>
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

          <TabsContent value="lost-feed" className="py-4">
            {/* Search and Filter */}
            <DocumentSearch onSearch={handleSearch} />
            
            {/* Lost Documents Feed */}
            <div className="flex items-center justify-between mt-6 mb-3">
              <h2 className="font-medium text-lg">
                {t('document.recentlyReported')}
              </h2>
              <div className="text-xs text-muted-foreground">
                {filteredDocuments.length} {t('document.documentsFound')}
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('common.loading')}</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 card-minimalist">
                <div className="bg-muted p-4 rounded-full inline-flex items-center justify-center mb-3">
                  <ScrollText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">{t('document.noLostDocuments')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {lostDocuments.length === 0
                    ? t('document.noReportedDocuments')
                    : t('document.adjustFilters')}
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setReportDialogOpen(true)}
                  className="mt-2"
                >
                  {t('document.reportYourLostDocument')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <LostDocumentCard
                    key={doc.id}
                    lostDocument={doc}
                    onContactClick={handleContactClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
