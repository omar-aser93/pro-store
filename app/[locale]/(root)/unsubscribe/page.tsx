import { Metadata } from "next";
import { unsubscribeNewsletter } from "@/lib/actions/newsletter.actions";
import { AlertCircle, CheckCircle } from "lucide-react"; //icons library auto installed by shadcn
import Link from "next/link";

//set page title to "Unsubscribed - Newsletter"
export const metadata: Metadata = {
  title: "Unsubscribed - Newsletter",
};


const UnsubscribePage = async ({ searchParams }: { searchParams: { token?: string }; }) => {  
 
  const token = searchParams.token;           //get newsletter token from url search params
  // if no token, return a div with error message & link to go back home
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md p-6 rounded-xl shadow-sm bg-red-50 border border-red-200 text-red-700 space-y-4 text-center">
          <div className="flex justify-center"> <AlertCircle className="h-6 w-6 text-red-600" /> </div>
          <h1 className="text-xl font-semibold">Oops!</h1>
          <p>Missing token. Please use the unsubscribe link in your email.</p>
          <Link href="/" className="inline-block mt-4 text-sm text-blue-600 hover:underline" > Go back home → </Link>
        </div>
      </main>
    );
  }

  //try unsubscribe server-action (receives user's newsletter token), if success, return a div with success message & link to go back home
  try {    
    await unsubscribeNewsletter(token);
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md p-6 rounded-xl shadow-sm bg-green-50 border border-green-200 text-green-700 space-y-4 text-center">
          <div className="flex justify-center"><CheckCircle className="h-6 w-6 text-green-600" /></div>
          <h1 className="text-xl font-semibold">Unsubscribed</h1>
          <p> You’ve successfully unsubscribed. Hope to see you as a subscriber again soon! </p>
          <Link href="/" className="inline-block mt-4 text-sm text-blue-600 hover:underline" > Go back home → </Link>
        </div>
      </main>
    );
  } catch (err) {
    // if error, return a div with error message & link to go back home
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md p-6 rounded-xl shadow-sm bg-red-50 border border-red-200 text-red-700 space-y-4 text-center">
          <div className="flex justify-center"><AlertCircle className="h-6 w-6 text-red-600" /></div>
          <h1 className="text-xl font-semibold">Error</h1>
          <p>{err instanceof Error ? err.message : "Something went wrong. Please try again."}</p>
          <Link href="/" className="inline-block mt-4 text-sm text-blue-600 hover:underline" > Go back home → </Link>
        </div>
      </main>
    );
  }
};

export default UnsubscribePage;