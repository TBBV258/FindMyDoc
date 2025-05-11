import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  conversationId: string;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, conversationId, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { isDemo } = useAuth();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) return;
    
    if (isDemo) {
      toast({
        title: "Demo Mode Restriction",
        description: "Sending messages is limited in demo mode",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    try {
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending) {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-white p-3 border-t border-lightGray max-w-md mx-auto">
      <div className="flex items-center">
        <button className="p-2 text-darkGray">
          <i className="ri-emotion-line text-xl"></i>
        </button>
        <div className="flex-1 mx-2">
          <Input
            type="text"
            className="w-full border border-lightGray rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={handleSend}
          disabled={disabled || isSending || !message.trim()}
          className="p-2 text-primary"
        >
          <i className="ri-send-plane-fill text-xl"></i>
        </Button>
      </div>
    </div>
  );
}
