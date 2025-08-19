"use client";
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Paperclip, MessageSquare, X, Loader2, Pencil, Trash2, Edit3, Check, CheckCheck, Bell, BellOff } from 'lucide-react';
import { sendMessageSchema, MessageType, ChatType, SendMessageType } from '@/lib/validator';
import { getOrCreateUserChat, sendMessage, setTypingStatus, deleteMessage, editMessage, getUserUnreadCounts, markMessagesAsRead } from '@/lib/actions/chat.actions';
import { pusherClient } from '@/lib/pusher-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UploadButton } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';


// UserChatWidget component for user-facing chat functionality
export function UserChatWidget() {
  // States to manage chat widget (open/closed), messages (+ editMsg), chat data, unread count, uploaded files, typing status, Notify sound, and loading states
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);  
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [editingMsgId, setEditingMsgId] = useState<string|null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [chat, setChat] = useState<ChatType | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);  
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState('');
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);      // ref to manage typing status timeout
  const containerRef = useRef<HTMLDivElement>(null);              // ref For messages container infinite scroll up
  const messagesEndRef = useRef<HTMLDivElement>(null);            // ref For auto scrolling to bottom of the chat;

  // React Hook Form setup with Zod validation
  const form = useForm({ resolver: zodResolver(sendMessageSchema), defaultValues: { chatId: '', content: '', fileUrl: '', fileType: '' } });


  // when component mounts and isOpen changes, Load chat data ... if isOpen is false, fetch unread count to display in a badge
  useEffect(() => {
    // Pusher channel variable, (let instead of const) outside the functions to allow reassignment at useEffect cleanup function.
    let channel: ReturnType<typeof pusherClient.subscribe> | null = null;

    // Function to initialize chat and subscribe to Pusher
    async function initChat() {
      if (!isOpen) return;               // Only initialize if the chat widget is open
      setIsLoading(true);                // Set loading state to true      
      try {
        // Fetch or create user chat (server-action) & destructure (the chat, nextCursor and hasMore) from the response
        const { chat: chatData, nextCursor, hasMore } = await getOrCreateUserChat();
        setChat(chatData);                                   // Set chat state with the fetched data
        setMessages(chatData.messages);                      // Set messages state with the initial messages
        setMessagesCursor(nextCursor || null);               // Set the messages-cursor state for the pagination
        setHasMoreMessages(hasMore);                         // Set has more messages state
        form.setValue('chatId', chatData.id);                // Ensure form is ready & contains chatId (hidden input)
        await markMessagesAsRead(chatData.id);               // Mark all admin messages as read when we open the chat
        // Subscribe to Pusher for real-time updates
        channel = pusherClient.subscribe(`chat-${chatData.id}`);
        // Bind to new-message pusher event to update messages state when a new message is received & scroll to bottom (If we want, we can add condition to only scroll if near the bottom, so It won't scroll when reading older messages), and play notification sound (if we want we can persist it using localstorage)
        channel.bind('new-message', (message: MessageType) => { setMessages((prev) => [...prev, message]); setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, 10); if (soundEnabled && message.sender.role === 'admin') { new Audio('/notification.mp3').play().catch(() => {}); } });
        // Bind to typing pusher event to update admin typing status
        channel.bind('typing', (data: { isTyping: boolean, senderRole: string }) => { if (data.senderRole === 'admin') { setIsAdminTyping(data.isTyping) }});
        // Bind to messages-read pusher event to Update user messages to read status (Admin viewed the messages)
        channel.bind('messages-read-by-admin', (data: { chatId: string; readerId: string }) => { setMessages(prev => prev.map(msg => msg.sender.id !== data.readerId  ? { ...msg, isRead: true } : msg )); setUnreadCount(0); });
        // Bind to message-deleted pusher event to handle optimistic updates: update the messages state after deleting a message
        channel.bind("message-deleted", ({ messageId }: { messageId: string }) => { setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: null, fileUrl: null, fileType: null }: m ) ); });
        // Bind to message-edited pusher event to handle optimistic updates: update the messages state after editing a message
        channel.bind("message-edited", (updated: MessageType) => { setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m ) ); });
        } catch (err) {       
        toast({ title: 'Error', description: `Failed to load chat. Please try again. ${err}`, variant: 'destructive' }); 
      } finally {
        setIsLoading(false);       // Set loading state to false after initialization
      }
    }
    initChat();                   // Call the initChat function to load chat data

    // Function to fetch unread count and subscribe to Pusher for real-time updates
    async function fetchUnreadCount() {       
      if (isOpen) return;                             // Only fetch if the chat widget is closed, otherwise return early 
      try {        
        const count = await getUserUnreadCounts();    // Fetch unread count using server action
        setUnreadCount(count.unreadCount);            // Set unread count state           
        if (count.chatId) {
          channel = pusherClient.subscribe(`chat-${count.chatId}`);   // Subscribe to Pusher for real-time updates
          // Bind to new-message pusher event to update unread count a new admin message is received 
          channel.bind('new-message', (message: MessageType) => { if ( message.sender.role === 'admin') { setUnreadCount((prev) => prev + 1) } });  
        }        
      } catch (err) {
        toast({ title: 'Error', description: `Failed to fetch unread count. ${err}`, variant: 'destructive' });
      }
    }
    fetchUnreadCount();            // Call the function to fetch unread count    

    // Cleanup function to unbind from all Pusher events and unsubscribe from Pusher channel when component unmounts or isOpen changes
    return () => { if (channel) { channel.unbind_all(); pusherClient.unsubscribe(channel.name); }
  };
  }, [isOpen, form, soundEnabled]);  


  // Function to load more messages when the user scrolls to the top of the chat
  const loadMoreMessages = async () => {
    // If no chat, no more messages, or already loading, return early
    if (!chat || !hasMoreMessages || isLoadingMore || !messagesCursor) return;
    setIsLoadingMore(true);                // Set loading state to true while fetching more messages
    // Save current scroll position
    const scrollContainer = containerRef.current;
    const previousScrollHeight = scrollContainer?.scrollHeight || 0;    
    try {
      // Fetch older messages from the server action, passing the messages cursor
      const { chat: newChatData, nextCursor, hasMore } = await getOrCreateUserChat(messagesCursor);
      setMessages(prev => [...newChatData.messages, ...prev]);     // Prepend older messages to the chat
      setMessagesCursor(nextCursor || null);                       // Update the messages cursor for next pagination
      setHasMoreMessages(hasMore);                                 // Update has more messages state
    } catch {
      toast({ title: 'Error', description: 'Failed to load older messages', variant: 'destructive' });   // if err, Show error toast 
    } finally {
      // restore scroll position after loading & set loading state to false
      setTimeout(() => {
        if (scrollContainer) { scrollContainer.scrollTop = scrollContainer.scrollHeight - previousScrollHeight }
        setIsLoadingMore(false);
      }, 0);
    }
  };


  // Effect to mark latest received admin messages as read
  useEffect(() => {
    // If chat is open, chat id exists, messages are loaded and last message is from admin and not read, mark it as read
    if (isOpen && chat?.id && messages.length > 0 && messages[messages.length - 1].sender.role === 'admin' && !messages[messages.length - 1].isRead) {
      markMessagesAsRead(chat.id);       // server action to mark messages as read
    }
  }, [messages, isOpen, chat?.id]);

  // Effect auto scrolls to the bottom of the chat messages when chat is loaded
  useEffect(() => {
    if (!isLoading) { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  }, [isLoading]);

  
  // function to handle form submission
  const onSubmit = async (data: SendMessageType ) => {
    if (!chat) return;             // Ensure chat is loaded before sending a message
    try {
      setIsUploading(true);         // Set uploading state to true while processing
      // Send message server action, passing chatId, content, fileUrl and fileType
      await sendMessage({ ...data, chatId: chat.id, fileUrl: uploadedFileUrl, fileType: uploadedFileType });        
      // After sending, Reset form & file states, but keep chatId
      form.reset({ chatId: chat.id, content: '', fileUrl: '', fileType: '' });
      setUploadedFileUrl('');
      setUploadedFileType('');
    } catch (err) {      
      toast({ title: 'Error', description: `Failed to send message. Please try again. ${err}`, variant: 'destructive' }); 
    } finally {
      setIsUploading(false);          // Reset uploading state after sending message
    }
  };

  // Function to handle message deletion
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteMessage(id);              // Call server action to delete message by id      
    } catch {
      toast({ title: 'Error', description: 'Failed to delete message.', variant: 'destructive' });  // if error, Show error toast 
    }
  };

  // Function to handle message editing
  const handleEditMessage = async (id: string) => {
    // If edited-message state is empty, show error toast & return out of the function
    if (!editContent.trim()) { toast({ title: 'Error', description: 'Message content cannot be empty.', variant: 'destructive' }); return; }
    try {
      setIsEditing(true);                      // Set isEditing state to true while processing
      await editMessage(id, editContent);      // Call server action to edit message by id with new content
      setEditingMsgId(null);                   // Reset (editing Msg id) state after successful edit, that will close the edit form
    } catch {
      toast({ title: 'Error', description: 'Failed to edit message.', variant: 'destructive' });   // if error, Show error toast
    } finally {
      setIsEditing(false);                     // Reset isEditing state after processing
    }
  }


  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
          {/* Header */}
          <div className="p-3 border-b flex justify-between items-center bg-primary text-white dark:text-slate-800 rounded-t-lg">
            <div className="flex items-center gap-3">
              <h3 className="font-medium">Support Chat</h3>
              <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? "Mute notifications" : "Unmute notifications"} >
                {soundEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={async () => { setIsOpen(false); }}  >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat Messages .. if loading, show loading message, otherwise show fetched chat messages */}          
          <div ref={containerRef} className="flex-1 p-3 overflow-y-auto" onScroll={e => { if (e.currentTarget.scrollTop === 0 && hasMoreMessages && !isLoadingMore) { loadMoreMessages() } }} >
            {isLoading ? ( <div className="flex items-center justify-center h-full"> <p>Loading chat...</p> </div>) 
              : ( <>
                {/* Loading indicator for older messages (infinite scroll) */}
                {isLoadingMore && ( <div className="flex justify-center items-center tx-sm gap-1 py-3 opacity-50"> <Loader2 className="animate-spin w-4 h-4" /> Loading older messages... </div> )}
                { /* Map through messages and display each message with its content, file, edit/delete buttons, and timestamp */ }
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("mb-3 p-2 rounded-lg max-w-[80%]", msg.sender.role === 'admin' ? "ml-auto bg-primary dark:bg-gray-800 text-white " : "mr-auto bg-gray-100 text-black" )} >
                    {/* If message is deleted, show "This message is deleted" */}
                    {msg.isDeleted ? ( <p className="italic text-gray-500">This message was deleted</p> ) 
                        // If message is being edited, show edit form 
                        : editingMsgId === msg.id ? (<div className="space-y-2">
                           <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} className="resize-none text-sm text-black dark:text-white" />
                           <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-green-700" onClick={() => handleEditMessage(msg.id)} disabled={editContent === msg.content || isEditing}><Check className="w-4 h-4 mr-1" /> Save </Button>
                            <Button size="sm" variant="outline" className='text-red-500' onClick={() => setEditingMsgId(null)} disabled={isEditing}> <X className="w-4 h-4 mr-1" /> Cancel </Button>
                          </div>
                        </div>
                      ) : ( 
                        // Display message content and uploaded file if available 
                        <>
                           {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                           {msg.fileUrl && ( <div className="mt-2">
                             {msg.fileType === 'image' ? (
                               <div className="relative w-full h-48">
                                 <Image src={msg.fileUrl} alt="Uploaded content" fill className="object-contain rounded-md" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                               </div>
                              ) : (
                               <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm" >
                                {msg.fileType ? `${msg.fileType.toUpperCase()} file` : 'View file'}
                               </a>
                              )}
                            </div>
                          )}     
                        </>
                      )} 

                    {/* Edit/delete message buttons (only for current user's messages & not admin messages) */}
                    {msg.sender.role !== 'admin' && !msg.isDeleted && editingMsgId !== msg.id && (
                      <div className="flex justify-end gap-2 mt-1 text-xs">
                        <Button onClick={() => { setEditingMsgId(msg.id); setEditContent(msg.content || ''); }} variant="ghost" size="icon" title='Edit' className="h-6 w-6 text-gray-500 hover:text-blue-500">
                          <Edit3 size={14} />
                        </Button>
                        <Button onClick={() => window.confirm('Are you sure you want to delete this message?') && handleDeleteMessage(msg.id)} variant="ghost" size="icon" title='Delete' className="h-6 w-6 text-gray-500 hover:text-red-500">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}  
                                  
                    {/* Message timestamp, edit status */}
                    <p className="text-xs mt-1 opacity-70 flex items-center gap-2">
                      <span>
                        {msg.isEdited && !msg.isDeleted && <span className="mr-1">(edited)</span>}
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {/* show Delivery status, only for user's own messages that aren't deleted  */}
                      {msg.sender.role !== 'admin' && !msg.isDeleted && (
                        <span title={msg.isRead ? 'Read' : 'Sent'} className={msg.isRead ? 'text-green-700' : 'text-gray-400'}>
                          {msg.isRead ? <CheckCheck className="w-4 h-4 -mr-1" /> : <Check className="w-4 h-4" /> }
                        </span>
                     )}
                    </p>
                  </div>
                ))}

                {/*typing indicator UI*/} 
                {isAdminTyping && (<div className="text-xs text-muted-foreground p-2 flex gap-1"> <Pencil className="h-4 w-4 animate-bounce text-muted-foreground" /> Admin is typing... </div>)}
                
                <div ref={messagesEndRef} />         {/* Scroll reference for auto-scrolling */}
              </>
            )}
          </div>  


          {/* Input Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-3 border-t flex items-center gap-2">

            {/* Upload Button */}
            <div className="h-9 w-9 p-0 mx-1 flex items-center justify-center relative">
              {/* Visible button */}
              <Button type="button" size="sm" variant="ghost" title="Upload file" className="h-9 w-9 mx-1 p-0 absolute bg-slate-200 dark:bg-slate-600" disabled={isLoading || isUploading} >
                <Paperclip className="h-4 w-4" />
              </Button>              
              {/* Hidden UploadThing button */}
              <div className="absolute inset-0 z-10">
                <UploadButton endpoint="fileUploader"
                  onUploadBegin={() => setIsUploading(true)}
                  onUploadError={(error: Error) => { toast({ title: 'Upload Error', description: error.message, variant: 'destructive' }); setIsUploading(false); }}
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      const file = res[0];
                      const ext = file.name.split('.').pop()?.toLowerCase() || '';                      
                      const fileType = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) ? 'image' : ext;
                      if (chat) { setUploadedFileUrl(file.ufsUrl); setUploadedFileType(fileType); }
                    }
                    setIsUploading(false);
                  }}
                  appearance={{ button: ({ ready }) => ({ width: '36px', height: '36px',  opacity: 0, cursor: ready ? 'pointer' : 'not-allowed' }), allowedContent: { display: 'none' } }}
                />
              </div>
            </div>
           
            {/* Message Input, disabled if isLoading or isUploading, onKeyDown to handle typing indicator */}            
            <Textarea {...form.register('content')} placeholder="Type a message..." rows={1} className="resize-none" disabled={isLoading || isUploading} 
              onKeyDown={async () => {
                if (!typingTimeout.current && chat) { await setTypingStatus(chat.id, true) }
                if (typingTimeout.current) { clearTimeout(typingTimeout.current) }
                typingTimeout.current = setTimeout(async () => {
                  if (chat) { await setTypingStatus(chat.id, false) }
                  typingTimeout.current = null;
                }, 1000);
              }}  />

            {/* Submit Button */}
            <Button type="submit" size="sm" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" /> }
            </Button>
          </form>

          {/* File Preview */}
          {uploadedFileUrl && (
            <div className="p-2">
              {uploadedFileType === 'image' ? (
                <div className="relative w-full h-20">
                  <Image src={uploadedFileUrl} alt="Preview" fill className="object-contain rounded-md" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground"> 📎 Attached file: {uploadedFileType.toUpperCase()}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        // Floating Open Chat Button, when clicked, opens the chat widget and resets unread count
        <Button onClick={() => { setIsOpen(true); }}  className="rounded-full h-14 w-14 shadow-lg" size="icon" >
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && <Badge className="absolute animate-bounce bg-red-700 top-0 right-0 py-1 px-2 text-white "> {unreadCount > 9 ? '9+' : unreadCount}</Badge>}
        </Button>
      )}
    </div>
  );
}