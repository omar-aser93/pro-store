'use client';

import { useState } from 'react';
import { Mail, Copy, Send, Share2, QrCode, MessageSquare } from 'lucide-react';     //icons lib auto installed with shadcn
import {QRCodeSVG} from 'qrcode.react';                                             //QRcode lib
//shadcn components
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';


//a share button component that opens a popover with share options
export default function ShareButton({ shareUrl, title = 'Check this out!' }: { shareUrl: string; title?: string; }) {
  
  const [open, setOpen] = useState(false);                 // state to control the popover open/close
  
  // function to copy the shareUrl to clipboard, if successful, show a toast message then close the popover
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Success', description: 'Link copied to clipboard!' });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* PopoverTrigger is the button that opens the popover */}
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4 mx-2" /> Share 
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-60 space-y-2">        
        <div className="grid grid-cols-3 gap-3">
         {/* Facebook share button */}
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" >
            <Button variant="ghost" size="icon" title='Share on Facebook'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" style={{ color: "#1877f2" }} viewBox="0 0 24 24" >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </Button>
          </a>
          {/* Twitter share button */}
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" >
            <Button variant="ghost" size="icon" title='Share on Twitter'>
              <span className="[&>svg]:h-7 [&>svg]:w-7 [&>svg]:fill-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </span>
            </Button>
          </a>
          {/* LinkedIn share button */}
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" >
            <Button variant="ghost" size="icon" title='Share on LinkedIn'>
              <span className="w-5 h-5 text-blue-700"> in </span>
            </Button>
          </a>
          {/* Telegram share button */}
          <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" >
            <Button variant="ghost" size="icon" title='Share on Telegram'>
              <Send className="w-5 h-5 text-blue-500" />
            </Button>
          </a>
          {/* WhatsApp share button */}
          <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" >
            <Button variant="ghost" size="icon" title='Share on WhatsApp'>
              <MessageSquare className="w-5 h-5 text-green-600" />
            </Button>
          </a>
         {/* Email share button */}         
          <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`}>
            <Button variant="ghost" size="icon" title='Share via Email'>
              <Mail className="w-5 h-5 text-red-500" />
            </Button>
          </a>
        </div>

        {/* Copy to clipboard, with copyToClipboard() function when button is clicked */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t">
          <Button variant="secondary" size="sm" className="w-full flex gap-2" onClick={copyToClipboard}>
            <Copy className="w-4 h-4" /> Copy
          </Button>
          {/* QR code button, when clicked it opens QR code popover that uses 'qrcode.react' lib */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="sm" className="w-full flex gap-2">
                <QrCode className="w-4 h-4" /> QR
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto text-center">
              <QRCodeSVG value={shareUrl} size={128} />
              <p className="mt-2 text-xs text-muted-foreground">Scan to share</p>
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  );
}