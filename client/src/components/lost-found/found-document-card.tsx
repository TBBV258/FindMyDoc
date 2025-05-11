import { FoundDocument } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";
import { DocumentIcon } from "@/components/ui/document-icon";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface FoundDocumentCardProps {
  foundDocument: FoundDocument;
  onClaimClick?: (id: string) => void;
}

export function FoundDocumentCard({ foundDocument, onClaimClick }: FoundDocumentCardProps) {
  const [_, navigate] = useLocation();

  const handleClaimClick = () => {
    if (onClaimClick) {
      onClaimClick(foundDocument.id);
    } else {
      // Default behavior - navigate to found document detail
      navigate(`/found/${foundDocument.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex">
            <DocumentIcon type={foundDocument.documentType} accent className="mr-3" />
            <div>
              <h3 className="font-medium">
                {foundDocument.documentType.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </h3>
              <p className="text-xs text-darkGray">
                Found {formatDate(foundDocument.foundAt)}
              </p>
            </div>
          </div>
          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Found</div>
        </div>
        
        <p className="text-sm mb-2">{foundDocument.description}</p>
        
        {foundDocument.foundLocation && (
          <div className="flex items-center text-xs text-darkGray">
            <i className="ri-map-pin-line mr-1"></i>
            <span>{foundDocument.foundLocation}</span>
          </div>
        )}
        
        {foundDocument.imageUrl && (
          <div className="mt-2 rounded overflow-hidden">
            <img 
              src={foundDocument.imageUrl} 
              alt="Document" 
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </div>
      <div className="border-t border-lightGray p-3 bg-background flex justify-between">
        <div className="flex items-center text-xs text-darkGray">
          <i className="ri-shield-check-line mr-1 text-primary"></i>
          <span>Verified finder</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClaimClick}
          className="text-sm text-accent flex items-center font-medium p-0 h-auto"
        >
          <i className="ri-checkbox-circle-line mr-1"></i> This is mine
        </Button>
      </div>
    </div>
  );
}
