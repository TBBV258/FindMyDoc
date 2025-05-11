import { Document } from "@/lib/firebase";
import { maskText, getInitials } from "@/lib/utils";
import { Link } from "wouter";
import { DocumentStatusBadge } from "./document-status-badge";
import { DocumentIcon } from "@/components/ui/document-icon";

interface DocumentCardProps {
  document: Document;
  onViewClick?: (id: string) => void;
  onEditClick?: (id: string) => void;
  onStatusToggle?: (id: string, currentStatus: 'active' | 'lost' | 'found') => void;
}

export function DocumentCard({ document, onViewClick, onEditClick, onStatusToggle }: DocumentCardProps) {
  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onViewClick) {
      onViewClick(document.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEditClick) {
      onEditClick(document.id);
    }
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onStatusToggle) {
      onStatusToggle(document.id, document.status);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <DocumentIcon type={document.type} className="mr-3" />
            <div>
              <h3 className="font-medium">{document.name}</h3>
              <p className="text-xs text-darkGray">
                ID: {maskText(document.documentNumber, 6)}
              </p>
            </div>
          </div>
          <DocumentStatusBadge status={document.status} />
        </div>
      </div>
      <div className="border-t border-lightGray p-3 bg-background flex justify-between">
        <Link 
          href={`/document/${document.id}`}
          onClick={handleViewClick}
          className="text-sm text-darkGray flex items-center"
        >
          <i className="ri-eye-line mr-1"></i> View
        </Link>
        <button 
          onClick={handleEditClick}
          className="text-sm text-darkGray flex items-center"
        >
          <i className="ri-edit-line mr-1"></i> Edit
        </button>
        {document.status === 'active' ? (
          <button 
            onClick={handleStatusToggle}
            className="text-sm text-warning flex items-center font-medium"
          >
            <i className="ri-alert-line mr-1"></i> Mark as Lost
          </button>
        ) : document.status === 'lost' ? (
          <button 
            onClick={handleStatusToggle}
            className="text-sm text-red-500 flex items-center font-medium"
          >
            <i className="ri-close-circle-line mr-1"></i> Cancel Lost Status
          </button>
        ) : (
          <div className="text-sm text-green-600 flex items-center font-medium">
            <i className="ri-check-double-line mr-1"></i> Found
          </div>
        )}
      </div>
    </div>
  );
}
