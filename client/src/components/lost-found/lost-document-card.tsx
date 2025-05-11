import { LostDocument } from "@/lib/firebase";
import { formatDate, getInitials } from "@/lib/utils";
import { DocumentIcon } from "@/components/ui/document-icon";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface LostDocumentCardProps {
  lostDocument: LostDocument;
  onContactClick?: (userId: string, documentId: string) => void;
}

export function LostDocumentCard({ lostDocument, onContactClick }: LostDocumentCardProps) {
  const [_, navigate] = useLocation();

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick(lostDocument.userId, lostDocument.documentId);
    } else {
      // Default behavior - navigate to chat
      navigate(`/chat/${lostDocument.userId}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex">
            <DocumentIcon type={lostDocument.document.type} warning className="mr-3" />
            <div>
              <h3 className="font-medium">{lostDocument.document.name}</h3>
              <p className="text-xs text-darkGray">
                Reported {formatDate(lostDocument.lostAt)}
              </p>
            </div>
          </div>
          <DocumentStatusBadge status="lost" />
        </div>
        
        <p className="text-sm mb-2">{lostDocument.description}</p>
        
        {lostDocument.lostLocation && (
          <div className="flex items-center text-xs text-darkGray">
            <i className="ri-map-pin-line mr-1"></i>
            <span>{lostDocument.lostLocation}</span>
          </div>
        )}
      </div>
      <div className="border-t border-lightGray p-3 bg-background flex justify-between">
        <div className="flex items-center text-xs text-darkGray">
          <div className="w-5 h-5 rounded-full bg-lightGray flex items-center justify-center mr-1">
            <span className="text-xs">{getInitials(lostDocument.user.username)}</span>
          </div>
          <span>{lostDocument.user.username}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleContactClick}
          className="text-sm text-secondary flex items-center font-medium p-0 h-auto"
        >
          <i className="ri-mail-line mr-1"></i> Contact
        </Button>
      </div>
    </div>
  );
}
