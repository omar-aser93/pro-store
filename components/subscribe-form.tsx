"use client"

import { subscribeToNewsletter } from "@/lib/actions/newsletter.actions"
import { useTransition } from 'react';
//import "react-hook-form" hook & zodResolver + the zod Schema/type from validator.ts
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { NewsletterSchema, NewsletterType } from "@/lib/validator"
//shadcn componenets
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from '@/hooks/use-toast';


//Subscribe component, using shadcn form components
const SubscribeForm = () => {

  const { toast } = useToast();                           //use toast hook to show success/error messages (shadcn)
  const [isPending, startTransition] = useTransition();   //useTransition() hook to allow pending state while submitting/event

  //useForm hook to create a form with zodResolver and defaultValues
  const form = useForm<NewsletterType>({ resolver: zodResolver(NewsletterSchema), defaultValues: { email: "" } })

  //onSubmit function to handle the form submission, will recieve the shadcn form values
  const onSubmit = (data: { email: string }) => {
    startTransition(async () => {
      //try to subscribe to the newsletter, show success/error toast & reset the form
      try {
        await subscribeToNewsletter(data.email)           //pass the email to the server-action
        toast({ title: "Subscribed!", description: "You'll receive our newsletter updates." })   
        form.reset()                                    
      } catch (error) {
        toast({ title: "Error", description: error instanceof Error ? error.message : "Subscription failed", variant: "destructive" })
      }
    })
  }

  return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-4 rounded-md border-gray-300 border-[1px] flex flex-col justify-center w-full">
      <h2 className="h2-bold mx-auto">Subscribe to our newsletter</h2>   
      <p className="mx-auto py-2" >Get the latest news and updates on our products and special offers</p>

      {/* Email input */}
      <FormField control={form.control} name="email" render={({ field }) => (
        <FormItem>
          <FormControl><Input className="w-1/2 mx-auto" placeholder="your@email.com" {...field} /></FormControl>
          <FormMessage className="text-red-500 text-center"/>
        </FormItem>
      )} />

      {/* Subscribe button */}
      <Button type="submit" className="w-1/2 mx-auto" disabled={isPending}> {isPending ? 'Subscribing...' : 'Subscribe'} </Button>
    </form>
  </Form>
  )
}

export default SubscribeForm