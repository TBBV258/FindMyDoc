import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { FoundDocument, storageMethods } from "@/lib/firebase";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentSearch } from "@/components/lost-found/document-search";
import { FoundDocumentCard } from "@/components/lost-found/found-document-card";
import { ReportFoundDocumentForm } from "@/components/documents/report-found-document-form";
import { Button } from "@/components/ui/button";
import { HintBox } from "@/components/ui/hint-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language";
import { SearchCheck, PlusCircle, ArrowDown, MapPin, Search } from "lucide-react";

export default function FoundFeed() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [foundDocuments, setFoundDocuments] = useState<FoundDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<FoundDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("found-feed");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if this is the first visit to the found feed
    const hasVisitedFoundFeed = localStorage.getItem('has-visited-found-feed');
    if (!hasVisitedFoundFeed) {
      setIsFirstVisit(true);
      localStorage.setItem('has-visited-found-feed', 'true');
    }

    const fetchFoundDocuments = async () => {
      setIsLoading(true);
      try {
        const docs = await storageMethods.getFoundDocuments();
        setFoundDocuments(docs);
        setFilteredDocuments(docs);
      } catch (error) {
        console.error("Error fetching found documents:", error);
        toast({
          title: t('common.error'),
          description: t('document.errorLoadingFound'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoundDocuments();
  }, [toast, t]);

  const handleSearch = (filters: { query: string; type: string; location: string }) => {
    let filtered = [...foundDocuments];
    
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.documentType.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          (doc.foundLocation && doc.foundLocation.toLowerCase().includes(query))
      );
    }
    
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((doc) => doc.documentType === filters.type);
    }
    
    if (filters.location) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(
        (doc) => doc.foundLocation && doc.foundLocation.toLowerCase().includes(location)
      );
    }
    
    setFilteredDocuments(filtered);
  };

  const handleClaimClick = (id: string) => {
    // In a real app, this would initiate the claiming process
    // and potentially create a conversation with the finder
    navigate(`/found/${id}/claim`);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "my-documents") {
      navigate("/home");
    } else if (value === "lost-feed") {
      navigate("/lost-feed");
    }
  };

  const handleReportSuccess = () => {
    setReportDialogOpen(false);
    // Refetch the found documents
    const fetchFoundDocuments = async () => {
      try {
        const docs = await storageMethods.getFoundDocuments();
        setFoundDocuments(docs);
        setFilteredDocuments(docs);
      } catch (error) {
        console.error("Error refetching found documents:", error);
      }
    };
    fetchFoundDocuments();
  };

  return (
    <MainLayout>
      <div className="container px-4 mx-auto pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('document.foundFeedTitle')}</h1>
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                {t('document.reportFound')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg w-[calc(100%-2rem)]">
              <ReportFoundDocumentForm 
                onSuccess={handleReportSuccess}
                onCancel={() => setReportDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isFirstVisit && (
          <HintBox 
            title={t('document.welcomeToFoundFeed')}
            hintKey="found-feed-intro"
            className="mb-4"
          >
            <div className="space-y-2">
              <p>{t('document.foundFeedIntro')}</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex flex-col items-center text-xs text-center">
                  <SearchCheck className="h-5 w-5 text-primary mb-1" />
                  <span>{t('document.inspectStep')}</span>
                </div>
                <div className="flex flex-col items-center text-xs text-center">
                  <MapPin className="h-5 w-5 text-primary mb-1" />
                  <span>{t('document.locateFoundStep')}</span>
                </div>
                <div className="flex flex-col items-center text-xs text-center">
                  <ArrowDown className="h-5 w-5 text-primary mb-1" />
                  <span>{t('document.reportFoundStep')}</span>
                </div>
              </div>
            </div>
          </HintBox>
        )}

        <Tabs defaultValue="found-feed" value={activeTab} onValueChange={handleTabChange}>
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

          <TabsContent value="found-feed" className="py-4">
            {/* Search and Filter */}
            <DocumentSearch onSearch={handleSearch} />
            
            {/* Found Documents Feed */}
            <div className="flex items-center justify-between mt-6 mb-3">
              <h2 className="font-medium text-lg">
                {t('document.recentlyFound')}
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
                  <SearchCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">{t('document.noFoundDocuments')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {foundDocuments.length === 0
                    ? t('document.noReportedFoundDocuments')
                    : t('document.adjustFilters')}
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setReportDialogOpen(true)}
                  className="mt-2"
                >
                  {t('document.reportFoundDocument')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <FoundDocumentCard
                    key={doc.id}
                    foundDocument={doc}
                    onClaimClick={handleClaimClick}
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
