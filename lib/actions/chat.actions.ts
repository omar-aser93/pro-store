"use server";

import { pusherServer } from '@/lib/pusher';          //import the Pusher server instance from pusher.ts, the file we created
import { prisma } from "@/db/prisma";                 //import the Prisma client from prisma.ts, the file we created
import { auth } from '@/auth';                        //import next-auth function from auth.ts, the file we created
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';          
import { chatSchema, ChatType, sendMessageSchema, SendMessageType } from '@/lib/validator';   // the Zod schemas and types 


// Get or create a user chat server-action
export async function getOrCreateUserChat(cursor?: string, limit = 20): Promise<{ chat: ChatType; nextCursor?: string; hasMore: boolean }> {
  // Check if the user is authenticated, if not, throw an error
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Find the first active chat of the user, include related user information
  let chat = await prisma.chat.findFirst({ where: { userId: session.user.id, isActive: true }, include: { user: true } });

  // If no chat is found, create a new chat for the user & include related messages object with sender information
  if (!chat) {
    chat = await prisma.chat.create({ data: { userId: session.user.id }, include: { user: true } });
    await pusherServer.trigger('admin-chats', 'new-chat', chat);         // pusher trigger to Notify admin with (the new created chat) event
  }  

  // Fetch the messages with a cursor-based pagination.
  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },                            // get the messages of this chat by its ID
    take: limit + 1,                                       // take the limit + fetch 1 extra message to check if there are more left
    orderBy: { createdAt: 'desc' },                        // order messages by createdAt in desc order (newest → oldest)
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),    // if a cursor provided, skip cursor message (avoid duplication)
    include: { sender: true }                              // include the sender information 
  });

  // if there are more messages than the limit, pop the last extra message (we got it to check if there are more messages for pagination) 
  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();   

  // return the chat & append its paginated messages in reverse order (latest first) + next cursor for pagination, and hasMore flag
  return { chat: { ...chat, messages: messages.reverse() }, nextCursor: messages[0]?.id, hasMore };    
}



// Send a message server action, called when a user sends a message in a chat, receives input data
export async function sendMessage(input: SendMessageType) {
  // Check if the user is authenticated, if not, throw an error
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  const { chatId, content, fileUrl, fileType } = sendMessageSchema.parse(input);     // Parse and validate the input data with Zod schema

  //create a new message in the database, including related chat user and sender information
  const message = await prisma.message.create({
    data: { chatId, senderId: session.user.id as string, content, fileUrl, fileType },
    include: { chat: { include: { user: true } }, sender: true }
  });

  // update the chat's updatedAt timestamp to the current time (useful for sorting chats list by last activity when displaying them)
  if (message) await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

  // Pusher real-time event trigger to notify the chat with the new message event 
  await pusherServer.trigger(`chat-${chatId}`, 'new-message', message);
  // Pucher real-time event trigger to notify admin with a new chat activity event, so the sidebar can be updated 
  await pusherServer.trigger('admin-chats', 'new-chat-activity', { chatId, message });
  
  return message;                            // Return the created message
}



// setTypingStatus server action, called when a user starts or stops typing in a chat (to notify the other user)
export async function setTypingStatus(chatId: string, isTyping: boolean) {
  // Check if the user is authenticated, if not, throw an error
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
 
  // pusher event trigger to handle isTyping status
  await pusherServer.trigger(`chat-${chatId}`, 'typing', { isTyping, senderRole: session.user.role });  
}



// Get all chats for admin server action, used to fetch all chats with their latest messages (to display in chats list sidebar)
export async function getChats(query?: string): Promise<ChatType[]> {
  // Check if the user is authenticated and has admin role, if not, throw an error
  const session = await auth();
  if (!session || session.user.role !== 'admin') throw new Error("Unauthorized");

  // Create a query filter to search for chats by user name or email
  const queryFilter: Prisma.ChatWhereInput = query ? { OR: [ { user: { name: { contains: query, mode: 'insensitive' } }}, { user: { email: { contains: query, mode: 'insensitive' }}} ] } : {};

  // Fetch all chats (filtered by query & ordered by updatedAt in desc order) & include their last message (including sender information) 
  const chats = await prisma.chat.findMany({
    where: queryFilter,    
    include: { user: true, messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: true } }},
    orderBy: { updatedAt: 'desc' },
  });

  // map through the chats and validate each one with Zod schema before returning them
  return chats.map(chat => chatSchema.parse(chat)); 
}



// Get a single chat & it's paginated messages (for admin active chat), by fetching a specific chat by its (ID & pagination params) we received 
export async function getChat(chatId: string, cursor?: string, limit = 20): Promise<{chat: ChatType; nextCursor?: string; hasMore: boolean;}> {
  // Check if the user is authenticated and has admin role, if not, throw an error
  const session = await auth();
  if (!session || session.user.role !== 'admin') { throw new Error("Unauthorized") }

  // find the chat by its ID, include related user info, If chat is not found, throw an error
  const chat = await prisma.chat.findUnique({ where: { id: chatId }, include: { user: true }});
  if (!chat) throw new Error("Chat not found");         

  // Fetch the messages with a cursor-based pagination.
  const messages = await prisma.message.findMany({
    where: { chatId },                                     // get the messages of this chat by its ID
    take: limit + 1,                                       // take the limit + fetch 1 extra message to check if there are more left
    orderBy: { createdAt: 'desc' },                        // order messages by createdAt in desc order (newest → oldest)
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),    // if a cursor provided, skip cursor message (avoid duplication)
    include: { sender: true }                              // include the sender information 
  });
 
  // if there are more messages than the limit, pop the last extra message (we got it to check if there are more messages for pagination) 
  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();       

  // Mark user messages as read, as the admin is viewing the chat
  if (session.user.role === 'admin' && chat) {
    await prisma.message.updateMany({ where: { chatId, isRead: false, senderId: { not: session.user.id } }, data: { isRead: true } });
  }

  // return the chat & append its paginated messages in reverse order (latest first) + next cursor for pagination, and hasMore flag
  return { chat: { ...chat, messages: messages.reverse() }, nextCursor: messages[0]?.id, hasMore };            
}



// Get unread messages counts (for admin) server action, used to fetch the count of unread messages for each of the users chats
export async function getUnreadCounts() {
  // Check if the user is authenticated and has admin role, if not, return an empty object
  const session = await auth();
  if (!session || session.user.role !== 'admin') return {};

  // Group messages by chatId where messages are unread and not sent by admin, then count them
  const counts = await prisma.message.groupBy({ by: ['chatId'], where: { isRead: false, NOT: { sender: { role: 'admin' }} }, _count: { _all: true } });

  // return the count, after Transform the grouped counts into a record with chatId as key and count as value
  return counts.reduce((acc, item) => { acc[item.chatId] = item._count._all; return acc; }, {} as Record<string, number>);
}



// Get unread messages counts (for user) server action, used to fetch the count of unread messages sent from admin to a user 
export async function getUserUnreadCounts() {
  // Check if the user is authenticated and has user role, if not, return no chat and unread count is 0
  const session = await auth();
  if (!session || session.user.role !== 'user') return {chatId: null, unreadCount: 0};

  // If user is authenticated, check if he has a chat, If No chat, return no chat and unread count is 0
  const chat = await prisma.chat.findFirst({ where: { userId: session.user.id }, select: { id: true } });
  if (!chat) return { chatId: null, unreadCount: 0 };

  // Count unread messages where messages are unread, sent by admin and belong to the user's chat
  return { chatId: chat.id, unreadCount: await prisma.message.count({ where: { isRead: false, sender: { role: 'admin' }, chatId: chat.id } }) };
}



// markMessagesAsRead server action, used to mark all unread messages as read for a specific chat by its ID
export async function markMessagesAsRead(chatId: string) {
  // Check if the user is authenticated, if not, throw an error
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized"); 

  // Check if the current user role... if admin, Mark user messages as read... if user, Mark admin messages as read (only when isRead is false, in both cases)
  if (session.user.role === 'admin') {     
    await prisma.message.updateMany({ where: { chatId, isRead: false, sender: { role: 'user' } }, data: { isRead: true } });
  } else {    
    await prisma.message.updateMany({ where: { chatId, isRead: false, sender: { role: 'admin' } }, data: { isRead: true } });
  }

  // Pusher event Trigger to notify the chat Admin/user that messages have been marked as read  
  await pusherServer.trigger(`chat-${chatId}`, session.user.role === 'admin' ? 'messages-read-by-admin' : 'messages-read-by-user', { chatId, readerId: session.user.id, readerRole: session.user.role });  
}



// deleteChat server action, used to delete a chat by its ID
export async function deleteChat(chatId: string) {
  // Check if the user is authenticated and has admin role, if not, return an error
  const session = await auth();
  if (!session || session.user.role !== 'admin') { return { success: false, message: "Unauthorized" } }
  try {
    await prisma.message.deleteMany({ where: { chatId } });                  // delete the chat's related messages
    await prisma.chat.delete({ where: { id: chatId } });                     // delete the chat itself by its ID
    await pusherServer.trigger('admin-chats', 'chat-deleted', { chatId });   // pusher trigger to notify admin about a deleted chat event
    revalidatePath('/admin/chats');                                          // Revalidate the admin chats page to get fresh data
    return { success: true, message: "Chat deleted successfully." };         // if success return success message
  } catch {                              
    return { success: false, message: "Failed to delete chat." };            // if error return error message
  }
}
  


//deleteMessage server action, used to delete a message by its ID
export async function deleteMessage(messageId: string) {
  // Check if the user is authenticated, if not, return an error
  const session = await auth();
  if (!session) return { success: false, message: "Unauthorized" };
  try {
    // Get the message by its ID , if not found, throw an error
    const message = await prisma.message.findUnique({ where: { id: messageId }});
    if (!message) return { success: false, message: "Message not found" };
    
    // Only allow deletion if user is admin or the message sender
    if (session.user.role !== 'admin' && message.senderId !== session.user.id) { return { success: false, message: "Unauthorized" };}

    // Delete the message by updating its status to isDeleted:true and clearing its content
    const deletedMessage = await prisma.message.update({ where: { id: messageId }, data: { isDeleted: true, content: null, fileUrl: null, fileType: null } });
    await pusherServer.trigger(`chat-${message.chatId}`, 'message-deleted', { messageId });  // Pusher trigger to notify chat members about a deleted message event
   
    return deletedMessage;             // Return the deleted message object
  } catch {
    return { success: false, message: "Failed to delete message." };     // If error, return an error message
  }   
}



//editMessage server action, used to edit a message by its ID
export async function editMessage(messageId: string, newContent: string) {
  // Check if the user is authenticated, if not, throw an error
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    // Get the message by its ID, if not found, throw an error
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new Error("Message not found");
    
    // Only allow editing if user is admin or the message sender
    if (session.user.role !== 'admin' && message.senderId !== session.user.id) { throw new Error("Unauthorized") }
    
    // Update the message content and mark it as edited
    const updatedMessage = await prisma.message.update({ where: { id: messageId }, data: { content: newContent, isEdited: true }, include: { sender: true, chat: { include: { user: true } }} });
    await pusherServer.trigger(`chat-${message.chatId}`, 'message-edited', updatedMessage);  // Pusher trigger to notify chat members about an edited message event
    
    return updatedMessage;                           // Return the updated message object
  } catch {
    throw new Error("Failed to edit message");       // If error, throw an error message
  }
}