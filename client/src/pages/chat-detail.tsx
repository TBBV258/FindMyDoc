import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { ChatMessage as ChatMessageType, User, storageMethods } from "@/lib/firebase";
import { MainLayout } from "@/components/layout/main-layout";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

export default function ChatDetail() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const conversationId = location.split("/")[2];
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    const fetchConversationData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch messages
        const msgs = await storageMethods.getMessages(conversationId);
        setMessages(msgs);
        
        // Find the other user's ID
        const otherUserId = msgs.length > 0
          ? msgs[0].senderId !== user.id
            ? msgs[0].senderId
            : (msgs.find(m => m.senderId !== user.id)?.senderId || "")
          : "";
        
        if (otherUserId) {
          // Fetch other user data
          const userData = await storageMethods.getUser(otherUserId);
          setOtherUser(userData);
        }
        
        // Decide whether to show verification based on message content
        // In a real app, this would be based on document claims
        setShowVerification(msgs.length >= 5);
      } catch (error) {
        console.error("Error fetching conversation:", error);
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationData();
  }, [user, conversationId, toast]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!user || !text.trim()) return;
    
    try {
      const newMessage: Omit<ChatMessageType, "id" | "timestamp" | "read"> = {
        conversationId,
        senderId: user.id,
        text,
      };
      
      const sentMessage = await storageMethods.sendMessage(newMessage);
      setMessages((prev) => [...prev, sentMessage]);
      
      // Award points for activity (in a real app, this would be more sophisticated)
      if (user.points < 100) {
        await storageMethods.updateUser(user.id, { points: user.points + 5 });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleVerify = () => {
    // In a real app, this would verify the document against the database
    if (verificationCode === "123") {
      toast({
        title: "Document Verified",
        description: "The document has been verified successfully",
      });
      setShowVerification(false);
      
      // Add system message to confirm verification
      const systemMessage: ChatMessageType = {
        id: `system-${Date.now()}`,
        conversationId,
        senderId: "system",
        text: "Document has been verified successfully. You can now arrange a safe meeting place to retrieve it.",
        timestamp: new Date(),
        read: true,
      };
      
      setMessages((prev) => [...prev, systemMessage]);
    } else {
      toast({
        title: "Verification Failed",
        description: "The code doesn't match. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout 
      title={otherUser?.username || "Chat"} 
      showBackButton
      showBottomNav={false}
    >
      {/* User Status */}
      {otherUser && (
        <div className="flex items-center px-4 py-1 border-b border-lightGray">
          <div className="flex items-center text-xs text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span>{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="p-4 bg-[#E5DDD5] min-h-[calc(100vh-136px)]">
        <div className="text-center text-xs text-darkGray mb-6">
          {messages.length > 0 
            ? new Date(messages[0].timestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Today"}
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-darkGray">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-lg">
            <div className="bg-white p-4 rounded-full inline-block mb-3">
              <i className="ri-message-3-line text-3xl text-darkGray"></i>
            </div>
            <h3 className="font-medium mb-2">No Messages Yet</h3>
            <p className="text-sm text-darkGray mb-4">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
              />
            ))}
          </>
        )}
        
        {/* Document verification card */}
        {showVerification && (
          <div className="bg-white rounded-lg p-3 shadow-sm mb-4 mx-auto max-w-[90%]">
            <div className="text-center mb-2">
              <i className="ri-shield-check-line text-xl text-primary"></i>
              <h4 className="font-medium text-sm">Document Verification</h4>
            </div>
            <p className="text-xs text-center text-darkGray mb-3">
              To confirm this is your document, please provide the last 3 digits of your ID number
            </p>
            <div className="flex justify-center mb-2">
              <input
                type="text"
                maxLength={3}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-20 border border-mediumGray rounded text-center py-1"
                placeholder="***"
              />
            </div>
            <button
              onClick={handleVerify}
              className="w-full bg-primary text-white text-sm py-2 rounded-lg font-medium"
            >
              Verify
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        conversationId={conversationId}
      />
    </MainLayout>
  );
}
