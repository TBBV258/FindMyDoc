import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { storageMethods } from "@/lib/firebase";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentForm } from "@/components/documents/document-form";
import { useToast } from "@/hooks/use-toast";

export default function AddDocument() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    type: string;
    name: string;
    documentNumber: string;
    description?: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add documents",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, this would add a document to the database
      await storageMethods.addDocument({
        userId: user.id,
        type: data.type,
        name: data.name,
        documentNumber: data.documentNumber,
        description: data.description,
        status: 'active',
      });

      toast({
        title: "Document Added",
        description: "Your document has been added successfully",
      });
      
      navigate("/home");
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout 
      title="Add Document" 
      showBackButton
      showBottomNav={false}
    >
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="text-center mb-6">
            <div className="inline-block bg-primary/10 p-3 rounded-full mb-2">
              <i className="ri-file-add-line text-3xl text-primary"></i>
            </div>
            <h2 className="font-roboto font-bold text-xl">Document Details</h2>
            <p className="text-darkGray text-sm">Add your important document for safekeeping</p>
          </div>
          
          <DocumentForm 
            onSubmit={handleSubmit}
          />
        </div>
        
        <div className="bg-background rounded-lg p-4 border border-lightGray">
          <div className="flex items-start mb-3">
            <i className="ri-lock-line text-xl text-primary mr-2"></i>
            <div>
              <h3 className="font-medium text-sm">Security Assurance</h3>
              <p className="text-xs text-darkGray">
                Your documents are encrypted and stored securely. Only you have access to them.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <i className="ri-information-line text-xl text-secondary mr-2"></i>
            <div>
              <h3 className="font-medium text-sm">Document Types</h3>
              <p className="text-xs text-darkGray">
                Free accounts can only store ID cards. Upgrade to Premium for passports, driver's licenses, and bank cards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
