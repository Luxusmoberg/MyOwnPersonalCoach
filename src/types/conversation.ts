export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}
