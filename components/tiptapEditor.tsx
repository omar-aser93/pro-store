'use client'

import { useCallback, useState, useRef } from 'react'
import { UploadButton } from '@/lib/uploadthing'
import EmojiPicker from 'emoji-picker-react'
// tiptap import & extensions
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontSize } from 'tiptap-extension-font-size'
import { Underline } from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
//shadcn components
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useToast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
//icons lib auto installed with shadcn
import { BoldIcon, ItalicIcon, StrikethroughIcon, CodeIcon, ImageIcon, LinkIcon, ListIcon, ListOrderedIcon, UndoIcon, RedoIcon, UnderlineIcon, PaletteIcon,
  TypeIcon, ChevronDownIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon, SmileIcon} from 'lucide-react'


// Tiptap Rich-Text Editor component
const TiptapEditor = ({ content = '', onChange, placeholder = 'Write something...'}: { content?: string; onChange: (content: string) => void; placeholder?: string}) => {
  
  const { toast } = useToast()                                              // Toast hook for notifications
  const [isImageUploading, setIsImageUploading] = useState(false)           // State to track image uploading
  const [fontSize, setFontSize] = useState('14px')                          // State to track font size  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)             // State to toggle emoji picker visibility
  const [color, setColor] = useState('#000000')                             // State to track text color
  const colorInputRef = useRef<HTMLInputElement>(null)                      // Ref for color input

  // Initialize the editor with the required extensions, content, onUpdate callback & default styles
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: {levels: [1, 2, 3]} }), Image.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({ placeholder }), TextStyle, Color, FontSize, Underline, 
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }}),      
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
    ],    
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => { onChange(editor.getHTML()) },
    editorProps: {
      attributes: { class: 'prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto min-h-[200px] px-4 py-2 focus:outline-none !max-w-none [&_ol]:list-decimal [&_ul]:list-disc' },
    },
  })

  // Handle image upload using Uploadthing, This function is called when the image upload is complete
  const handleImageUpload = useCallback(
    async (res: { url: string }[]) => {
      if (!editor) return
      try {
        setIsImageUploading(true)
        if (res && res[0].url) { editor.chain().focus().setImage({ src: res[0].url }).run() }
      } catch {
        toast({ title: 'Error', description: 'Failed to insert image', variant: 'destructive' })
      } finally {
        setIsImageUploading(false)
      }
    },
    [editor, toast]
  )

  // Function to apply font size
  const applyFontSize = () => {
    if (editor) { editor.chain().focus().setFontSize(fontSize).run() }
  }

  // Function to apply text color
  const applyColor = () => {
    if (editor) { editor.chain().focus().setColor(color).run() }
  }

  // Function to handle emoji click
  const onEmojiClick = (emojiData: { emoji: string }) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run()
    setShowEmojiPicker(false)
  }

  // if editor is not initialized, return null to avoid rendering issues
  if (!editor) { return null }

  return (
    <div className="rounded-lg border focus-within:ring-0 focus-within:ring-offset-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b p-1 bg-slate-400/10 dark:bg-slate-400/20">
        {/* Font Size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" size="sm" variant="ghost" className="gap-1" title='Font Size' >
              <TypeIcon className="h-4 w-4" />
              <ChevronDownIcon className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="flex items-center gap-2">
              <Input type="text" value={fontSize} onChange={(e) => setFontSize(e.target.value)} placeholder="e.g. 14px" className="h-8" />
              <Button size="sm" onClick={applyFontSize}> Apply </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" size="sm" variant="ghost" title='Text Color' >
              <PaletteIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="flex items-center gap-2">
              <input type="color" value={color}  onChange={(e) => setColor(e.target.value)} ref={colorInputRef} className="h-8 w-8 cursor-pointer" />
              <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 flex-1" />
              <Button size="sm" onClick={applyColor}> Apply </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Text Formatting */}
        <Button onClick={() => editor.chain().focus().toggleBold().run()} type="button" size="sm" title="Bold" variant={editor.isActive('bold') ? 'default' : 'ghost'} >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} type="button" size="sm" title="Italic" variant={editor.isActive('italic') ? 'default' : 'ghost'} >
          <ItalicIcon className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().toggleUnderline().run()} type="button" size="sm" title="Underline" variant={editor.isActive('underline') ? 'default' : 'ghost'} >
          <UnderlineIcon className="h-4 w-4" />
        </Button>       
        <Button onClick={() => editor.chain().focus().toggleStrike().run()} type="button" size="sm" title="Strike" variant={editor.isActive('strike') ? 'default' : 'ghost'} >
          <StrikethroughIcon className="h-4 w-4" />
        </Button>
        
        {/* Emoji Picker */}
        <div className="relative">
          <Button onClick={() => setShowEmojiPicker((prev) => !prev)} type="button" size="sm" variant="ghost" title="Insert Emoji" >
            <SmileIcon className="h-4 w-4"/>
          </Button>
          {showEmojiPicker && (<div className="absolute z-50 mt-2"><EmojiPicker onEmojiClick={onEmojiClick} /></div>)}
        </div>

        {/* Code Block */}
        <Button onClick={() => editor.chain().focus().toggleCode().run()} type="button" size="sm" title="Code" variant={editor.isActive('code') ? 'default' : 'ghost'} >
          <CodeIcon className="h-4 w-4" />
        </Button>

        {/* Headings */}
        <Button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} type="button" size="sm" title='Heading 1' variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'} >
          H1
        </Button>
        <Button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} type="button" size="sm" title='Heading 2' variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'} >
          H2
        </Button>
        <Button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} type="button" size="sm" title='Heading 3' variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'} >
          H3
        </Button>

        {/* Lists */}
        <Button type="button" size="sm"  title='Bullet List' onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'default' : 'ghost'} >
          <ListIcon className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" title='Ordered List' onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'default' : 'ghost'} >
          <ListOrderedIcon className="h-4 w-4" />
        </Button>

        {/* Blockquote */}
        <Button type="button" size="sm" title='Blockquote' onClick={() => editor.chain().focus().toggleBlockquote().run()} variant={editor.isActive('blockquote') ? 'default' : 'ghost'} >
          &quot;&quot;
        </Button>

        {/* Text Alignment */}
        <Button onClick={() => editor.chain().focus().setTextAlign('left').run()} type="button" size="sm" title="Align Left" variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'} >
          <AlignLeftIcon className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().setTextAlign('center').run()} type="button" size="sm" title="Align Center" variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'} >
          <AlignCenterIcon className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().setTextAlign('right').run()} type="button" size="sm" title="Align Right" variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'} >
          <AlignRightIcon className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().setTextAlign('justify').run()} type="button" size="sm" title="Justify" variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'} >
          <AlignJustifyIcon className="h-4 w-4" />
        </Button>

        {/* Image Upload */}
        <div className="h-9 w-9 p-0 flex items-center justify-center">
          <UploadButton endpoint="imageUploader"  onClientUploadComplete={handleImageUpload}
            onUploadError={(error: Error) => { toast({ title: 'Upload Error', description: error.message, variant: 'destructive' }) }}
            appearance={{
              button: ({ ready }) => ({ position: 'absolute', width: '36px', height: '36px', opacity: 0, cursor: ready ? 'pointer' : 'not-allowed' }),
              allowedContent: { display: 'none' },
            }}
          />
          <Button type="button" size="sm" variant="ghost" title='Upload Image' className="h-9 w-9 p-0" disabled={isImageUploading} >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Horizontal Rule */}
        <Button onClick={() => editor.chain().focus().setHorizontalRule().run()} type="button" size="sm" variant="ghost" title='Horizontal Rule' >
          —
        </Button>

        {/* Undo/Redo */}
        <Button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} type="button" size="sm" variant="ghost" title='Undo' >
          <UndoIcon className="h-4 w-4" />
        </Button>
        <Button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} type="button" size="sm" variant="ghost" title='Redo' >
          <RedoIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Bubble Menu, appear when text is selected */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 rounded-lg border bg-background p-1 shadow-lg">
            <Button type="button" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'default' : 'ghost'} >
              <BoldIcon className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'default' : 'ghost'} >
              <ItalicIcon className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} variant={editor.isActive('underline') ? 'default' : 'ghost'} >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} variant={editor.isActive('strike') ? 'default' : 'ghost'} >
              <StrikethroughIcon className="h-4 w-4" />
            </Button>
            {/* set the text as Link */}
            <Button type="button" size="sm" variant={editor.isActive('link') ? 'default' : 'ghost'}
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href
                const url = window.prompt('URL', previousUrl)
                if (url === null) return
                if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
              }}>
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <div className="[&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default TiptapEditor