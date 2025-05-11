import { Conversation, User, ChatMessage, storageMethods } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { formatDate, getInitials } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  otherUser: User | null;
  lastMessage: ChatMessage | null;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, otherUser, lastMessage, isActive, onClick }: ConversationItemProps) {
  return (
    <div 
      className={`flex items-center p-4 border-b border-lightGray hover:bg-background cursor-pointer ${isActive ? 'bg-background' : ''}`}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full bg-lightGray flex items-center justify-center mr-3">
        {otherUser?.photoURL ? (
          <img src={otherUser.photoURL} alt={otherUser.username} className="w-12 h-12 rounded-full" />
        ) : (
          <span className="text-textDark font-medium">{getInitials(otherUser?.username || 'Unknown')}</span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="font-medium">{otherUser?.username || 'Unknown User'}</h3>
          <span className="text-xs text-darkGray">
            {lastMessage ? formatDate(lastMessage.timestamp) : 'No messages'}
          </span>
        </div>
        <p className="text-sm text-darkGray truncate">
          {lastMessage ? (
            lastMessage.imageUrl ? 'Sent an image' : lastMessage.text
          ) : 'Start a conversation'}
        </p>
      </div>
    </div>
  );
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  const [location, navigate] = useLocation();
  const [otherUsers, setOtherUsers] = useState<Record<string, User | null>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, ChatMessage | null>>({});
  
  useEffect(() => {
    // Fetch other users and last messages for each conversation
    const fetchConversationData = async () => {
      const users: Record<string, User | null> = {};
      const messages: Record<string, ChatMessage | null> = {};
      
      for (const conversation of conversations) {
        // Get the other user ID
        const otherUserId = conversation.participants.find(id => id !== currentUserId);
        
        if (otherUserId) {
          try {
            // Fetch user data
            const userData = await storageMethods.getUser(otherUserId);
            users[conversation.id] = userData;
          } catch (error) {
            users[conversation.id] = null;
          }
        }
        
        try {
          // Fetch messages
          const conversationMessages = await storageMethods.getMessages(conversation.id);
          messages[conversation.id] = conversationMessages.length > 0 
            ? conversationMessages[conversationMessages.length - 1] 
            : null;
        } catch (error) {
          messages[conversation.id] = null;
        }
      }
      
      setOtherUsers(users);
      setLastMessages(messages);
    };
    
    fetchConversationData();
  }, [conversations, currentUserId]);
  
  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };
  
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="bg-background p-4 rounded-lg mb-4">
          <i className="ri-chat-3-line text-3xl text-darkGray"></i>
        </div>
        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
        <p className="text-sm text-darkGray">
          When someone contacts you about a lost or found document, it will appear here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-lightGray">
      {conversations.map(conversation => (
        <ConversationItem 
          key={conversation.id}
          conversation={conversation}
          otherUser={otherUsers[conversation.id] || null}
          lastMessage={lastMessages[conversation.id]}
          isActive={location === `/chat/${conversation.id}`}
          onClick={() => handleConversationClick(conversation.id)}
        />
      ))}
    </div>
  );
}
