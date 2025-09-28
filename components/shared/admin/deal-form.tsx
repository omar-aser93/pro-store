"use client";
import { useState, useTransition } from "react";
import { dealFormSchema, DealFormType } from "@/lib/validator";            // zod schemas & types
import { getDeal, createDeal } from "@/lib/actions/product.actions";       // server-actions
import { Trash2, Plus, Upload } from "lucide-react";        // icons lib auto installed with shadcn
import { UploadButton } from "@/lib/uploadthing";           // UploadButton from uploadthing.ts               
import Image from "next/image";
import { formatDateTimeInput } from "@/lib/utils";         // utility function to handle local date-time input
// imports of 'react-hook-form' & zodResolver
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Shadcn components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";  


// DealEditor component, a Button that opens a modal form to create/edit deal
export default function DealEditor() {

  const [open, setOpen] = useState(false);                          // state to check if modal is open or closed
  //useTransition hooks to handle a pending state
  const [isPending, startTransition] = useTransition();         
  const [isUploading, startUploadTransition] = useTransition();

  // useForm hook to handle form data, we pass zod resolver & the default values 
  const form = useForm<DealFormType>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {  titles: [{ lang: "en", content: "" }], descriptions: [{ lang: "en", content: "" }], imageUrl: "", buttonLink: "/search", targetDate: new Date() },
  });


  // function to fetch existing deal and set it to the form
  const loadDeal = async () => {
    const current = await getDeal();                  // server-action to fetch existing deal       
    if (current) {
      form.setValue("titles", current.titles as { lang: string; content: string }[]);
      form.setValue("descriptions", current.descriptions as { lang: string; content: string }[]);
      form.setValue("imageUrl", current.imageUrl);
      form.setValue("imageLink", current.imageLink);
      form.setValue("buttonLink", current.buttonLink);
      form.setValue("targetDate", new Date(current.targetDate));
    }
  };

  // function to handle modal open, if open, call loadDeal() function
  const handleOpen = async (state: boolean) => {
    setOpen(state);
    if (state) await loadDeal();
  };

  // function to handle form submission
  const onSubmit = (data: DealFormType) => {
    startTransition(async () => {          // start the transition to handle isPending
      try {     
        await createDeal(data);             // server-action to create/update deal, we pass the form data
        toast({ title: "Success", description: "Deal saved successfully" });      // show success toast
        setOpen(false);                     // close the modal
      } catch {
        toast({ variant: "destructive", description: "Something went wrong, please try again" });    // show error toast
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      {/* Create/edit deal button that opens the modal */}
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#ffca28] text-white">Create/Edit Deal</Button>
      </DialogTrigger>

      {/* Modal form content */}
      <DialogContent className="max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Modal header */}
            <DialogHeader>
              <DialogTitle>Create/update a deal</DialogTitle>
              <DialogDescription> Create or update the deal of the month </DialogDescription>
            </DialogHeader>  
            {/* Titles Section */}
            <div>
              <h3 className="mb-2">Titles</h3>
              {form.watch("titles").map((_, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  {/* Language input */}
                  <FormField control={form.control} name={`titles.${index}.lang`}
                    render={({ field }) => ( 
                      <FormItem className="w-1/4">
                        <FormControl><Input placeholder="Lang" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Title input */}
                  <FormField control={form.control} name={`titles.${index}.content`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl><Input placeholder="Title" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Delete a title button */}
                  <Button type="button" variant="ghost" size="icon" onClick={() => { const titles = form.getValues("titles"); form.setValue("titles", titles.filter((_, i) => i !== index)); }} >
                    <Trash2 size={16} color="red"/>
                  </Button>
                </div>
              ))}
              {/* Add a title button */}
              <Button type="button" variant="outline" onClick={() => form.setValue("titles", [ ...form.getValues("titles"), { lang: "", content: "" } ]) }>
                <Plus size={16} className="mr-2" /> Add Title
              </Button>
              {/* Array-level error message */}             
              {form.formState.errors.titles && (<p className="text-sm font-medium text-destructive mt-2"> {form.formState.errors.titles.root?.message} </p>)}
            </div>

            <hr/>

            {/* Descriptions Section */}
            <div>
              <h3 className="mb-2">Descriptions</h3>
              {form.watch("descriptions").map((_, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  {/* Language input */}
                  <FormField control={form.control} name={`descriptions.${index}.lang`}
                    render={({ field }) => (
                      <FormItem className="w-1/4">
                        <FormControl><Input placeholder="Lang" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Description textarea */}
                  <FormField control={form.control} name={`descriptions.${index}.content`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl><Textarea placeholder="Description" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Delete a description button */}
                  <Button type="button" variant="ghost" size="icon" onClick={() => { const descs = form.getValues("descriptions"); form.setValue("descriptions", descs.filter((_, i) => i !== index)); }}>
                    <Trash2 size={16} color="red"/>
                  </Button>
                </div>
              ))}
              {/* Add a description button */}
              <Button type="button" variant="outline"  onClick={() => form.setValue("descriptions", [ ...form.getValues("descriptions"), { lang: "", content: "" } ]) }>
                <Plus size={16} className="mr-2" /> Add Description
              </Button>
              {/* Array-level error message */}
              {form.formState.errors.descriptions && (<p className="text-sm font-medium text-destructive mt-2"> {form.formState.errors.descriptions.root?.message} </p>)}
            </div>

            <hr/>

            {/* Image Upload */}
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Promotional Image</FormLabel>
                <FormControl>
                  <div>
                  <div className="h-9 w-9 p-0 mx-1 flex items-center justify-center relative">
                    {/* Visible Uploadthing button */}
                    <Button type="button" size="sm" variant="ghost" title="Upload file" className={`h-9 w-9 p-0 mx-1 absolute bg-slate-200 dark:bg-slate-600 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''} `} disabled={isUploading}>
                      <Upload className="h-4 w-4" /> 
                    </Button>
                    {/* Hidden UploadThing button */}
                    <div className="absolute inset-0 z-10">
                      <UploadButton endpoint="imageUploader" onUploadBegin={()=> startUploadTransition( async () => {})}
                        onUploadError={(error: Error) => { toast({ title: "Upload Error", description: error.message, variant: "destructive" }); }}
                        onClientUploadComplete={(res) => { if (res && res.length > 0) { const file = res[0]; field.onChange(file.ufsUrl); } }}
                        appearance={{ button: ({ ready }) => ({ width: "36px", height: "36px", opacity: 0, cursor: ready ? "pointer" : "not-allowed" }), allowedContent: { display: "none" } }}
                      />
                    </div>
                  </div>
                  {/* Preview The Image */}
                  {field.value && (<Image width={300} height={300} src={field.value} alt="Preview" className="rounded-md my-2 mx-auto" />)}
                </div>
                </FormControl>
                <FormMessage /> {/* This will show validation errors */}
              </FormItem>
            )} />

            {/* Image Link input */}         
            <FormField control={form.control} name="imageLink" render={({ field }) => (
              <FormItem>
                <FormLabel> Image Link (Optional) </FormLabel>
                <FormControl><Input placeholder="Where to go when the image is clicked?" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
              )}
            />
            
            <hr/>

            {/* Target Date-Time input */}
            <FormField control={form.control} name="targetDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Target Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={formatDateTimeInput(field.value)} onChange={(e) => field.onChange(new Date(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
              )}
            />           

            {/* Button Link input */}
            <FormField control={form.control} name="buttonLink" render={({ field }) => (
              <FormItem>
                <FormLabel>Button Link </FormLabel>
                <FormControl><Input placeholder="Button Link" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
              )}
            />
           
            {/* Submit Button, disabled if isPending */}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Deal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
