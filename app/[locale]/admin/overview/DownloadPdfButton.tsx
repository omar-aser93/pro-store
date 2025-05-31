"use client";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";


//Download PDF button component, using 'html2pdf.js' library
export default function DownloadPdfButton() {

  const [isPending, startTransition] = useTransition();       //useTransition hook to handle a pending state

  //function to handle the pdf download onClick
  const handleDownload = () => {
    startTransition(async () => {
      try {
        //get the element we want to convert to pdf, and if it doesn't exist, return outside the function.
        const element = document.querySelector("#pdf-content");
        if (!element) return;

        // @ts-expect-error: the library definition has no ts
        const html2pdf = (await import("html2pdf.js")).default;

        //set the options for the pdf
        const opt = {
          margin: 0.5,
          filename: "admin-overview.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };

        html2pdf().set(opt).from(element).save();              //convert the element to pdf
      } catch (error) {
        console.error("PDF generation failed:", error);
      }
    });
  };

  //render the download button... when download is pending, hide it to prevent it from showing in the pdf
  return (
    <Button variant="outline" onClick={handleDownload} className={isPending ? "hidden" : ""}> Download PDF </Button>
  );
}
