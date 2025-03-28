'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';              //package converts names to slugs (URL-friendly version of product name)
import { UploadButton } from '@/lib/uploadthing';             //import UploadButton from uploadthing.ts
import { createProduct, updateProduct } from '@/lib/actions/product.actions';
import { insertProductSchema, Product, updateProductSchema } from '@/lib/validator';  //import zod Schemas/types from validator.ts
//imports of 'react-hook-form' & zodResolver
import { useForm } from 'react-hook-form';
import { ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
//shadcn components
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


//product form component, receives type prop (create or update), also receives product prop if type is update 
const ProductForm = ({ type, product }: { type: 'Create' | 'Update'; product?: Product; }) => {
  
  const router = useRouter();                            //useRouter hook to navigate to a page
  const { toast } = useToast();                          //useToast hook to show toast messages
   
  //Define useForm hook & pass (Zod Schema & type) to the zodResolver after checking type (create or update), also pass default values
  const form = useForm<Product>({ resolver: type === 'Update' ? zodResolver(updateProductSchema) : zodResolver(insertProductSchema),
    defaultValues: product && type === 'Update' ? product : {name: '', slug: '', category: '', images: [], brand: '', description: '', price: '0', stock: 0, rating: '0', numReviews: 0, isFeatured: false, banner: null}
  });

  //Handle form submit
  const onSubmit = async (values: Product ) => {
    if (type === 'Create') {
      const res = await createProduct(values);          //pass the form data to createProduct server-action
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message });     //if error, show error toast
      } else {
        toast({ description: res.message });                             //if success, show success toast
        router.push(`/admin/products`);                                  //navigate to Admin products page
      }
    }
    if (type === 'Update') {
      if (!product?.id) { router.push(`/admin/products`); return; }       //if no product id, navigate to Admin products page
      const res = await updateProduct({ ...values, id: product?.id });    //pass the form data to updateProduct server-action
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message });    //if error, show error toast
      } else {
        toast({ description: res.message });                            //if success, show success toast
        router.push(`/admin/products`);                                 //if success, navigate to Admin products page
      }
    }
  };

  //`watch` method to manually get current values of `images`, `isFeatured` and `banner` fields .. will use them in the UI & conditional rendering
  const images = form.watch('images');      
  const isFeatured = form.watch('isFeatured');
  const banner = form.watch('banner');

  return (
    <Form {...form}>
      <form className="space-y-8" method='post' onSubmit={form.handleSubmit(onSubmit)}>

        <div className="flex flex-col gap-5 md:flex-row">
          {/* Name */}
          <FormField control={form.control} name="name" render={({ field }: { field: ControllerRenderProps<Product, "name"> }) => (
            <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="Enter product name" {...field} /></FormControl>
                <FormMessage />
            </FormItem> )}
          />
          {/* Slug */}
          <FormField control={form.control} name="slug" render={({ field }: { field: ControllerRenderProps<Product, "slug"> }) => (
            <FormItem className="w-full">
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <div className="relative">
                <Input placeholder="Enter product slug" className="pl-4" {...field} />
                {/* Button to Generate a Slug based on product Name, uses slugify package  */}
                <Button type='button' className='bg-gray-500 text-white px-4 py-1 mt-2 hover:bg-gray-600'
                        onClick={() => { form.setValue('slug', slugify(form.getValues('name'), { lower: true })); }} >
                    Generate
                </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem> )} 
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          {/* Category */}
          <FormField control={form.control} name='category' render={({ field }: { field: ControllerRenderProps<Product, 'category'> }) => (
            <FormItem className='w-full'>
              <FormLabel>Category</FormLabel>
              <FormControl><Input placeholder='Enter category' {...field} /></FormControl>
              <FormMessage />
            </FormItem> )}
          />
          {/* Brand */}
          <FormField control={form.control} name='brand' render={({ field }: { field: ControllerRenderProps<Product, 'brand'> }) => (
            <FormItem className='w-full'>
              <FormLabel>Brand</FormLabel>
              <FormControl><Input placeholder='Enter product brand' {...field} /></FormControl>
              <FormMessage />
            </FormItem> )}
          />
        </div>
        
        <div className="flex flex-col gap-5 md:flex-row">
          {/* Price */}
          <FormField control={form.control} name='price' render={({ field }: { field: ControllerRenderProps<Product, 'price'> }) => (
            <FormItem className='w-full'>
              <FormLabel>Price</FormLabel>
              <FormControl><Input placeholder='Enter product price' {...field} /></FormControl>
              <FormMessage />
            </FormItem> )}
          />
          {/* Stock */}
          <FormField control={form.control} name='stock' render={({ field }: { field: ControllerRenderProps<Product, 'stock'> }) => (
            <FormItem className='w-full'>
              <FormLabel>Stock</FormLabel>
              <FormControl><Input type='number' placeholder='Enter product stock' {...field} /></FormControl>
              <FormMessage />
            </FormItem> )}
          />
        </div>

        {/* Images */}    
        <div className="upload-field flex flex-col gap-5 md:flex-row">
          <FormField control={form.control} name='images' render={() => (
            <FormItem className='w-full'>
              <FormLabel>Images</FormLabel>
              <Card>
                <CardContent className='my-2'>
                  <div className='flex-start space-x-2'>
                    {/* Map through the images & display them */}
                    {images.map((image: string) => (
                      <div key={image} className='relative'>
                        <Image key={image} src={image} alt='product image' width={100} height={100}  className='w-20 h-20 object-cover object-center rounded-sm' />
                        <Button type="button" onClick={() => { form.setValue('images', images.filter((_, i) => i !== images.indexOf(image))); }} className="absolute top-0 right-0 text-sm bg-red-500 p-3  w-4 h-4 hover:opacity-60 " > X </Button>
                      </div>
                    ))}                    
                    {/* Uploadthing button, with onClientUploadComplete() to set images array & onUploadError() to show err toast */}
                    <FormControl className='border border-dashed border-gray-400 rounded-md px-2 pb-4 text-center bg-[#e8f0fe]'>
                      <UploadButton endpoint='imageUploader' onClientUploadComplete={(res: { url: string }[]) => { form.setValue('images', [...images, res[0].url]); }}
                         onUploadError={(error: Error) => { toast({ variant: 'destructive', description: `ERROR! ${error.message}` }); }} />
                    </FormControl>
                  </div>
                </CardContent>
              </Card>
              <FormMessage />
            </FormItem> )}
           />
        </div>

        {/* Is Featured & Banner Image */}    
        <div className='upload-field'>
          Featured Product
          <Card>
            <CardContent className='space-y-2 mt-4  '>
              <FormField control={form.control} name='isFeatured' render={({ field }) => (
                <FormItem className='space-x-2 items-center'>
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel>Is Featured?</FormLabel>
                </FormItem> )}
              />
              {/* if isFeatured is checked & banner image is uploaded, display the banner image */}
              {isFeatured && banner && (<Image src={banner} alt='banner image' width={1920} height={680} className=' w-full object-cover object-center rounded-sm' /> )}
              {/* if isFeatured is checked, display the upload button */}
              {isFeatured && !banner && (
              <UploadButton className='border border-dashed border-gray-400 rounded-md px-2 pb-4 text-center bg-[#e8f0fe]'
                 endpoint='imageUploader' onClientUploadComplete={(res: { url: string }[]) => { form.setValue('banner', res[0].url); }}
                 onUploadError={(error: Error) => { toast({ variant: 'destructive', description: `ERROR! ${error.message}` }); }} />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Description */}
        <div>
          <FormField control={form.control} name='description' render={({ field }: { field: ControllerRenderProps<Product, 'description'> }) => (
            <FormItem className='w-full'>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder='Enter product description' className='resize-none' {...field} /></FormControl>
              <FormMessage />
            </FormItem> )}
          />
        </div>
                
        {/* Submit Button, disable at `reac-hook-form` Submitting */}        
        <Button type='submit' size='lg' disabled={form.formState.isSubmitting} className='button col-span-2 w-full' >
          {form.formState.isSubmitting ? 'Submitting' : `${type} Product`}
        </Button>        
      </form>
    </Form>
  );
};

export default ProductForm;