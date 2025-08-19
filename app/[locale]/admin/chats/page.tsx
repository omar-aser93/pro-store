import { AdminChat } from '@/components/chat/AdminChat';
import { Metadata } from 'next'

//set page title to "Chats"
export const metadata: Metadata = {
  title: 'Chats',
}


export default function AdminChatsPage() {
  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-6">Customer Support Chats</h1>
      {/* AdminChat component */}
      <AdminChat />
    </div>
  );
}