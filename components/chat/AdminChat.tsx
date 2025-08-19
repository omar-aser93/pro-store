"use client";
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Paperclip, Loader2, Pencil, ArrowLeft, Trash2, Edit3, Check, X, CheckCheck, Bell, BellOff } from 'lucide-react';       
import { sendMessageSchema, ChatType, SendMessageType, MessageType } from '@/lib/validator';
import { getChats, getChat, sendMessage, getUnreadCounts, setTypingStatus, deleteChat, deleteMessage, editMessage, markMessagesAsRead } from '@/lib/actions/chat.actions';
import DeleteDialog from '@/components/shared/delete-dialog';
import { pusherClient } from '@/lib/pusher-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadButton } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';


// AdminChat component for managing and viewing all user chats in the admin panel
export function AdminChat() {  
  // States to manage chats list, active chat & it's paginated messages, editing message, unread counts, uploaded file, Notify sound, typing status, and loading states
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);  
  const [editingMsgId, setEditingMsgId] = useState<string|null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [chatsIsLoading, setChatsIsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [responsivePanel, setResponsivePanel] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);      // ref to manage typing status timeout
  const containerRef = useRef<HTMLDivElement>(null);              // ref For messages container infinite scroll up
  const messagesEndRef = useRef<HTMLDivElement>(null);            // ref For auto scrolling to bottom of the chat

  //useSearchParams() hook to get URL searchParams in a client-component, we use it to get q param for searching chats list
  const searchParams = useSearchParams();        
  const query = searchParams.get('query') || '';
    
  // React Hook Form setup with Zod validation
  const form = useForm({ resolver: zodResolver(sendMessageSchema), defaultValues: { chatId: '', content: '', fileUrl: '', fileType: '' } });


  // when the component mounts, Load all chats initially and setup Pusher listeners
  useEffect(() => {
    async function loadChats() {
      setChatsIsLoading(true);                // Set chats loading state to true
      try {
        // ✅ Fetch chats and unread counts using their server actions (promise.all for parallel requests)
        const [chatsData, unreadCounts] = await Promise.all([ getChats(query), getUnreadCounts() ]);
        setChats(chatsData);              // Set chats state
        setUnreadCounts(unreadCounts);    // Set unread counts state
      } catch (err) {       
        toast({ title: 'Error', description: `Failed to load chats. Please try again. ${err}`, variant: 'destructive' });
      } finally {
        setChatsIsLoading(false);         // Set chats loading state to false
      }
    }

    loadChats();                    // Call the loadChats function

    // Subscribe to Pusher admin-chats channel for chats list real-time updates (sidebar)
    const channel = pusherClient.subscribe('admin-chats');
    // Pusher event to handle a new chat created by a user, so we refetch the chats list
    channel.bind('new-chat', loadChats);    
    // Pusher event to handle new chat activity, so we update the chats list with the latest message and unread count
    channel.bind('new-chat-activity', ({ chatId, message }: { chatId: string; message: MessageType }) => {
      // Update chats list state with the latest new message, and sort the chats by updated time
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMessage: message.content || (message.fileUrl ? '📎 File attachment' : ''), updatedAt: message.createdAt } : c ).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));      
      // Only increment unread count if this chat is NOT currently active
      if (chatId !== activeChat?.id) { setUnreadCounts(prev => ({ ...prev, [chatId]: (prev[chatId]||0) + 1 })); }      
    });    
    // Pusher event to handle a chat deletion
    channel.bind('chat-deleted', (data: { chatId: string }) => {      
      if (activeChat?.id === data.chatId) { setActiveChat(null) }       // If the deleted chat is the active one, reset its state
      setChats(prev => prev.filter(chat => chat.id !== data.chatId));   // Update chats list by filtering out the deleted chat
    });

    // a Pusher channel variable, (let instead of const) to allow reassignment at useEffect cleanup.
    let chatChannel: ReturnType<typeof pusherClient.subscribe> | null = null;
    // If an active chat is selected, subscribe to its Pusher channel for a single chat real-time updates 
    if (activeChat?.id) {
      chatChannel = pusherClient.subscribe(`chat-${activeChat.id}`);
      // bind to new-message event to update the active chat messages in real-time & scroll to the bottom (If we want, we can add condition to only scroll if near the bottom, so It won't scroll when reading older messages), and play notification sound (if we want we can persist it using localstorage)
      chatChannel.bind('new-message', (message: MessageType) => { setActiveChat(prev => prev ? { ...prev, messages: [...prev.messages, message] } : prev ); setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, 10); if (soundEnabled && message.sender.role === 'user') { new Audio('/notification.mp3').play().catch(() => {}); } });
      //bind to typing event to update the typing status of the user in the active chat
      chatChannel.bind('typing', (data: { isTyping: boolean; senderRole: string }) => { if (data.senderRole === 'user') { setIsUserTyping(data.isTyping) } });
      // bind to messages-read-by-user event to update the read status of messages in the active chat
      chatChannel.bind('messages-read-by-user', (data: { chatId: string; readerId: string }) => { setActiveChat(prev => prev ? { ...prev, messages: prev.messages.map(m => m.sender.id !== data.readerId ? { ...m, isRead: true } : m ) } : prev ) });
      // bind to message-edited to update the active chat messages in real-time
      chatChannel.bind('message-edited', (data: MessageType) => { setActiveChat(prev => prev ? { ...prev, messages: prev.messages.map(m => m.id === data.id ? { ...m, ...data } : m) } : prev ); });
      // bind to message-deleted event to update the active chat messages in real-time
      chatChannel.bind('message-deleted', ({ messageId }: { messageId: string }) => { setActiveChat(prev => prev ? { ...prev, messages: prev.messages.map(m => m.id === messageId ? { ...m, isDeleted: true, content: null, fileUrl: null, fileType: null } : m ) } : prev ) });
    }

    // Cleanup function to unbind from all Pusher events and unsubscribe from all Pusher channels when component unmounts or active chat changes
    return () => { channel.unbind_all(); pusherClient.unsubscribe('admin-chats'); if (chatChannel) { chatChannel.unbind_all(); pusherClient.unsubscribe(`chat-${activeChat?.id}`); } };
  }, [activeChat?.id, query, soundEnabled]);  


  // Effect to mark messages as read when the active chat is selected and the last message is from the user
  useEffect(() => {
    if (activeChat?.id && activeChat.messages.length && activeChat.messages[activeChat.messages.length - 1].sender.role === 'user' && !activeChat.messages[activeChat.messages.length - 1].isRead) {
      markMessagesAsRead(activeChat.id);           // server action to mark messages as read          
    }
  }, [activeChat?.messages, activeChat?.id]);

  // Effect auto scrolls to the bottom of the chat messages when chat is loaded
  useEffect(() => {    
    if (!isLoading ) { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  }, [isLoading]);
 

  // This function fetches the selected chat from the chats list and sets it as the active chat
  const handleSelectChat = async (chatId: string) => {
    if (chatId === activeChat?.id) return;    // if the selected chat is already active, do nothing & return early
    setIsLoading(true);                       // Set loading state to true 
    setMessagesCursor(null);                  // Reset messages cursor
    setHasMoreMessages(true);                 // Reset has more messages state         
    try {
      // Fetch the chat data server-action & destructure (the chat, nextCursor and hasMore) from the response
      const { chat, nextCursor, hasMore } = await getChat(chatId);     
      setActiveChat(chat);                      // Set the active chat state
      setMessagesCursor(nextCursor || null);    // Set the messages-cursor state for the pagination
      setHasMoreMessages(hasMore);              // Set has more messages state
      form.setValue('chatId', chatId);          // Ensure form is ready & contains chatId (hidden input)
      setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));       // Reset unread count for this chat
      setResponsivePanel(true);                                  // Set responsive panel state to true for mobile view
    } catch (err) {      
      toast({ title: 'Error', description: `Failed to load chat. Please try again. ${err}`, variant: 'destructive' });
    } finally {
       setIsLoading(false);                      // Set loading state to false      
    }
  };

  // Function to load more messages when the user scrolls to the top of the chat
  const loadMoreMessages = async () => {
    // If no active chat, no more messages, or already loading, return early
    if (!activeChat || !hasMoreMessages || isLoadingMore) return; 
    // Save current scroll position
    const scrollContainer = containerRef.current;
    const previousScrollHeight = scrollContainer?.scrollHeight || 0;
    setIsLoadingMore(true);             // Set loading state to true while fetching more messages
    try {
      // Fetch older messages from the server action, passing the active chat id and messages cursor
      const { chat, nextCursor, hasMore } = await getChat(activeChat.id, messagesCursor ?? undefined);    
      setActiveChat(prev => ({ ...prev!, messages: [...chat.messages, ...prev!.messages] }));   // Append older messages to the active chat 
      setMessagesCursor(nextCursor || null);               // Update messages cursor for next pagination
      setHasMoreMessages(hasMore);                         // Update has more messages state
      // Restore scroll position after update      
      if (scrollContainer) { scrollContainer.scrollTop = scrollContainer.scrollHeight - previousScrollHeight; }    
    } catch {
      toast({ title: 'Error', description: 'Failed to load older messages', variant: 'destructive' }); // if error, Show error toast
    } finally {
      setIsLoadingMore(false);              // Reset loading state after fetching more messages
    }
  };

  // function to handle Submit a new message form
  const onSubmit = async (data: SendMessageType) => {
    if (!activeChat) return;                  // If not an active chat, do nothing
    try {
      setIsUploading(true);                   // Set uploading state to true while processing
      // Send message server action, passing chatId, content, fileUrl and fileType
      await sendMessage({ ...data, chatId: activeChat.id, fileUrl: uploadedFileUrl, fileType: uploadedFileType,}); 
      // After sending, Reset form & file states, but keep chatId                  
      form.reset({ chatId: activeChat.id, content: '', fileUrl: '' });         
      setUploadedFileUrl('');                 
      setUploadedFileType('');                
    } catch (err) {      
      toast({ title: 'Error', description: `Failed to send message. Please try again. ${err}`, variant: 'destructive' });
    } finally {
      setIsUploading(false);              // Reset uploading state after sending message
    }
  };

  // Function to handle message deletion button 
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteMessage(id);              // Call server action to delete message by id      
    } catch {
      toast({ title: 'Error', description: 'Failed to delete message.', variant: 'destructive' });  // if error, Show error toast 
    }
  };

  // Function to handle message editing button
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
    <div className="flex h-[calc(100vh-64px)]">
        
      {/* Left sidebar : Chats list */}
      <div className={cn("w-full md:w-80", responsivePanel && 'hidden md:block')}>          
        {/* Header for the chats list */}
        <div className="p-4 border-b"> <h2 className="font-semibold">Chats</h2> </div>
        {/* Chats list with a scroll area, if loading, show a loading message, else show the fetched chats */}
        <ScrollArea className="h-full">
          {chatsIsLoading && !chats.length ? (<div className="p-4 text-center">Loading chats...</div>) : (
            chats.map(chat => (
              <div key={chat.id} onClick={() => handleSelectChat(chat.id)} className={cn("p-4 border-b cursor-pointer hover:bg-gray-50", activeChat?.id === chat.id && 'bg-gray-100', unreadCounts[chat.id] && 'font-medium' )} >
                <div className="flex justify-between items-center">
                  {/* User name of each chat*/}
                  <span className="text-black dark:text-gray-500">{chat.user.name}</span>
                  {/* Unread message count badge, only show if there are unread messages */}
                  {unreadCounts[chat.id] > 0 && (<span className="bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"> {unreadCounts[chat.id]} </span> )}
                  {/* Delete Button component */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <DeleteDialog id={chat.id} action={deleteChat} />
                  </div>
                </div>
                {/* Display the last message of each chat (real-time/intial-fetch) or a placeholder if (a file or no messages) */}
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage ? chat.lastMessage : (chat.messages[0]?.isDeleted ? 'Message deleted' : chat.messages[0]?.content || (chat.messages[0]?.fileUrl ? '📎 File attachment' : 'No messages yet'))}
                </p>
                {/* Display the last updated time of each chat */}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(chat.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </ScrollArea>        
      </div>
     

      {/* Right panel (active chat) */}
      <div className={cn("flex-1 flex flex-col", !responsivePanel && 'hidden md:flex')}>
        {activeChat ? (
          <>
            {/* Header for the active chat */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-medium">{activeChat.user.name}</h3>
                <p className="text-sm text-gray-500">{activeChat.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? "Mute notifications" : "Unmute notifications"}>
                  {soundEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                </Button>
                <Button onClick={() => setResponsivePanel(false)} className="md:hidden">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </div>
            </div>

            {/* Active Chat messages with scroll area , if loading, show a loading message, else show the fetched messages*/}
            <div ref={containerRef} className="flex-1 p-4 overflow-y-auto" onScroll={e => { if (e.currentTarget.scrollTop === 0 && hasMoreMessages && !isLoadingMore) {loadMoreMessages();} }}>
              {isLoading ? (<div className="flex items-center justify-center h-full"> <p>Loading messages...</p> </div>
                ) : (<>
                {/* Loading indicator for older messages (infinite scroll) */}
                {isLoadingMore && ( <div className="flex justify-center items-center tx-sm gap-1 py-3 opacity-50"> <Loader2 className="animate-spin w-4 h-4" /> Loading older messages... </div> )}
                {activeChat.messages.map(msg => (
                  <div key={`${msg.id}-${msg.createdAt}`} className={cn("mb-4 p-3 rounded-lg max-w-[70%]", msg.sender.role === 'admin' ? 'ml-auto bg-primary dark:bg-gray-800 text-white' : 'mr-auto bg-gray-100 text-black ' )} >
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

                      {/* Edit/delete message buttons */}
                      {!msg.isDeleted && editingMsgId !== msg.id && (
                      <div className="flex justify-end gap-2 mt-1 text-xs">
                        <Button onClick={() => { setEditingMsgId(msg.id); setEditContent(msg.content || ''); }} variant="ghost" size="icon" title='Edit' className="h-6 w-6 text-gray-500 hover:text-blue-500">
                          <Edit3 size={14} />
                        </Button>
                        <Button onClick={() => window.confirm('Are you sure you want to delete this message?') && handleDeleteMessage(msg.id)} variant="ghost" size="icon" title='Delete' className="h-6 w-6 text-gray-500 hover:text-red-500">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}  
                                  
                    {/* Message timestamp and edit status */}
                    <p className="text-xs mt-1 opacity-70 flex items-center gap-2">
                      <span>
                        {msg.isEdited && !msg.isDeleted && <span className="mr-1">(edited)</span>}
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {/* Show delivery status, only for admin's own messages that aren't deleted */}
                      {msg.sender.role === 'admin' && !msg.isDeleted && (
                        <span title={msg.isRead ? 'Read' : 'Sent'} className={msg.isRead ? 'text-green-700' : 'text-gray-400'}>
                          {msg.isRead ? <CheckCheck className="w-4 h-4 -mr-1" /> : <Check className="w-4 h-4" /> }
                        </span>
                      )}
                    </p>
                  </div>
                ))
              }

              {/*typing indicator UI*/} 
              {isUserTyping && (<div className="text-xs text-muted-foreground p-2 flex gap-1"> <Pencil className="h-4 w-4 animate-bounce text-muted-foreground" /> User is typing... </div>)}

              <div ref={messagesEndRef} />      {/* Scroll reference to auto-scroll to the latest message */}
              </> )}
            </div>

            {/* Input form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 border-t flex items-center gap-2">
              {/* File Upload */}
              <div className="h-9 w-9 p-0 mx-1 flex items-center justify-center relative">
                {/* Visible button */}
                <Button type="button" size="sm" variant="ghost" title="Upload file" className="h-9 w-9 p-0 mx-1 absolute bg-slate-200 dark:bg-slate-600" disabled={isLoading || isUploading} >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                {/* Hidden UploadThing button */}
                <div className="absolute inset-0 z-10">
                  <UploadButton endpoint="fileUploader" onUploadBegin={() => setIsUploading(true)}
                    onUploadError={(error: Error) => { toast({ title: 'Upload Error', description: error.message, variant: 'destructive' }); setIsUploading(false) }}
                    onClientUploadComplete={(res) => {
                      if (res && res.length > 0) {
                        const file = res[0];
                        const ext = file.name.split('.').pop()?.toLowerCase() || '';
                        const fileType = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) ? 'image' : ext;
                        if (activeChat) { setUploadedFileUrl(file.ufsUrl); setUploadedFileType(fileType); } 
                      }
                      setIsUploading(false);
                    }}
                    appearance={{ button: ({ ready }) => ({ width: '36px', height: '36px', opacity: 0, cursor: ready ? 'pointer' : 'not-allowed' }), allowedContent: { display: 'none' } }} />
                </div>
              </div>

              {/* Message Input, disabled if loading or uploading, onKeyDown handles typing indicator*/}            
              <Textarea {...form.register('content')} placeholder="Type a message..." rows={1} className="resize-none" disabled={isLoading || isUploading} 
                onKeyDown={async () => {
                  if (!typingTimeout.current) { await setTypingStatus(activeChat.id, true) }
                  if (typingTimeout.current) { clearTimeout(typingTimeout.current) }
                  typingTimeout.current = setTimeout(async () => {
                    await setTypingStatus(activeChat.id, false);
                    typingTimeout.current = null;
                  }, 1000);
                }} />
                               
              {/* Submit Button */}
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading || isUploading ? (<Loader2 className="h-5 w-5 animate-spin" />) : (<><Send className="h-5 w-5 mr-2 rtl:ml-2" /> Send</>)}
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
          </>
        ) : (
          // If no active chat is selected, show a message 
          <div className="flex-1 flex items-center justify-center">
            <p>Select a chat to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}