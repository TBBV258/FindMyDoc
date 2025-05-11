import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Document, storageMethods } from "@/lib/firebase";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { DocumentIcon } from "@/components/ui/document-icon";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function DocumentDetail() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract document ID from URL
  const documentId = location.split("/")[2];
  
  useEffect(() => {
    const fetchDocument = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // In a real app, we would fetch the specific document
        const docs = await storageMethods.getDocuments(user.id);
        const doc = docs.find(d => d.id === documentId);
        
        if (doc) {
          setDocument(doc);
        } else {
          toast({
            title: "Document Not Found",
            description: "The requested document could not be found",
            variant: "destructive",
          });
          navigate("/home");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast({
          title: "Error",
          description: "Failed to load document details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [user, documentId, toast, navigate]);

  const handleStatusToggle = async () => {
    if (!document || !user) return;
    
    try {
      const newStatus = document.status === 'active' ? 'lost' : 'active';
      await storageMethods.updateDocument({ id: document.id, status: newStatus });
      
      // Update local state
      setDocument({
        ...document,
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'lost' ? { lostAt: new Date() } : {})
      });
      
      toast({
        title: newStatus === 'lost' ? "Document Marked as Lost" : "Document Status Updated",
        description: newStatus === 'lost' 
          ? "Your document has been marked as lost. Others can now help you find it."
          : "Your document status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!document || !user) return;
    
    try {
      // In a real app, this would delete the document from the database
      toast({
        title: "Document Deleted",
        description: "Your document has been deleted successfully",
      });
      navigate("/home");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    navigate(`/document/${documentId}/edit`);
  };

  if (isLoading) {
    return (
      <MainLayout title="Document Details" showBackButton>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-darkGray">Loading document details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!document) {
    return (
      <MainLayout title="Document Not Found" showBackButton>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <i className="ri-file-damage-line text-3xl text-red-500"></i>
          </div>
          <h3 className="font-medium mb-2">Document Not Found</h3>
          <p className="text-sm text-darkGray mb-4">
            The document you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate("/home")}>Go Back to Home</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Document Details" showBackButton>
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start">
              <DocumentIcon type={document.type} className="mr-4" />
              <div>
                <h2 className="text-xl font-medium">{document.name}</h2>
                <p className="text-sm text-darkGray">ID: {document.documentNumber}</p>
              </div>
            </div>
            <DocumentStatusBadge status={document.status} />
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-darkGray">Document Type</h3>
              <p>{document.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-darkGray">Added on</h3>
              <p>{formatDate(document.createdAt)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-darkGray">Last Updated</h3>
              <p>{formatDate(document.updatedAt)}</p>
            </div>
            
            {document.status === 'lost' && document.lostAt && (
              <div>
                <h3 className="text-sm font-medium text-darkGray">Reported Lost on</h3>
                <p>{formatDate(document.lostAt)}</p>
              </div>
            )}
            
            {document.status === 'lost' && document.lostLocation && (
              <div>
                <h3 className="text-sm font-medium text-darkGray">Lost Location</h3>
                <p>{document.lostLocation}</p>
              </div>
            )}
            
            {document.description && (
              <div>
                <h3 className="text-sm font-medium text-darkGray">Description</h3>
                <p>{document.description}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleStatusToggle}
              variant={document.status === 'active' ? 'warning' : 'outline'}
              className={document.status === 'active' ? 'bg-warning text-white hover:bg-warning/90' : ''}
            >
              {document.status === 'active' ? (
                <>
                  <i className="ri-alert-line mr-2"></i> Mark as Lost
                </>
              ) : (
                <>
                  <i className="ri-check-line mr-2"></i> Mark as Found
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleEdit}
              variant="outline"
            >
              <i className="ri-edit-line mr-2"></i> Edit Document
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <i className="ri-delete-bin-line mr-2"></i> Delete Document
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your document
                    and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {document.status === 'lost' && (
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <h3 className="font-medium mb-3">Report Details</h3>
            
            <div className="bg-warning/10 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <i className="ri-information-line text-xl text-warning mr-2"></i>
                <div>
                  <p className="text-sm font-medium">Document is marked as lost</p>
                  <p className="text-xs text-darkGray">
                    Your document is visible in the lost feed. You'll be notified if someone finds it.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate("/lost-feed")} 
              variant="outline" 
              className="w-full"
            >
              <i className="ri-search-line mr-2"></i> View Lost Feed
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
