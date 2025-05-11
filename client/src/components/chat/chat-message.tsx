import { ChatMessage as ChatMessageType } from "@/lib/firebase";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  return (
    <div className={cn("flex mb-4", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] p-3 shadow-sm",
          isOwn ? "chat-bubble-right" : "chat-bubble-left"
        )}
      >
        {message.text && <p className="text-sm mb-1">{message.text}</p>}
        
        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden">
            <img 
              src={message.imageUrl} 
              alt="Shared image" 
              className="w-full h-auto"
            />
          </div>
        )}
        
        <div className="text-right text-xs text-darkGray">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
