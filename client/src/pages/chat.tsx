import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Conversation, storageMethods } from "@/lib/firebase";
import { MainLayout } from "@/components/layout/main-layout";
import { ConversationList } from "@/components/chat/conversation-list";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const convs = await storageMethods.getConversations(user.id);
        setConversations(convs);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Error",
          description: "Failed to load your conversations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user, toast]);

  return (
    <MainLayout 
      title="Conversations" 
      subtitle="Message document owners and finders"
      hasNotifications
    >
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-darkGray">Loading conversations...</p>
        </div>
      ) : (
        <ConversationList 
          conversations={conversations} 
          currentUserId={user?.id || ''}
        />
      )}
    </MainLayout>
  );
}
