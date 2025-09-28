"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";


//BulkForm component to wrap around any table (as children) to enable checkboxs selection & deletion, it receives the server-action & children as prop
export default function BulkForm({ action, submitText, children }: { action: (formData: FormData) => void; submitText: string; children: React.ReactNode;}) {
  
  const [selectedCount, setSelectedCount] = useState(0);     // State to track number of selected checkboxes
  const [selectAll, setSelectAll] = useState(false);         // State to track if "Select All" checkbox is checked
  const formRef = useRef<HTMLFormElement>(null);             // Ref to the form element

  // Handle change event when any of thecheckboxes are checked or unchecked
  function handleChange(e: React.ChangeEvent<HTMLFormElement>) {
    // Count checked checkboxes to update selectedCount state
    const checked = e.currentTarget.querySelectorAll<HTMLInputElement>("input[name=ids]:checked").length;
    setSelectedCount(checked);    
    // check if all checkboxes are selected to update selectAll state
    const totalCheckboxes = e.currentTarget.querySelectorAll<HTMLInputElement>("input[name=ids]").length;
    setSelectAll(checked === totalCheckboxes && totalCheckboxes > 0);
  }

  // Handle select all event when "Select All" checkbox is checked or unchecked
  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    // Get all checkboxes with attr name="ids" inside the form
    const checkboxes = formRef.current?.querySelectorAll<HTMLInputElement>("input[name=ids]");
    // If checkboxes exist, check/uncheck all of them based on "Select All", then update selectedCount & selectAll states
    if (checkboxes) {
      checkboxes.forEach((checkbox) => { checkbox.checked = e.target.checked; });      
      setSelectedCount(e.target.checked ? checkboxes.length : 0);
      setSelectAll(e.target.checked);
    }
  }

  // Handle form submission, show confirm before submitting  
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if ( selectedCount === 0 || !confirm(`Are you sure you want to apply this action to ${selectedCount} product(s)?`) ) {
      e.preventDefault();
    }
  }

  return (
    <form ref={formRef} action={action} onChange={handleChange} onSubmit={handleSubmit} className="space-y-4" >
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          {/* Select All checkbox, with indeterminate (-) state when some but not all checkboxes are selected */}
          <input type="checkbox" checked={selectAll} onChange={handleSelectAll}
            ref={(input) => { if (input) { input.indeterminate = selectedCount > 0 && !selectAll; } }}
          />
          {/* Display number of selected checkboxes or "All selected" if all checkboxes are selected */}
          <span className="text-sm text-muted-foreground">
            {selectAll ? "All selected" : `${selectedCount} selected`}
          </span>
        </div>
        
        {/* Submit button */}
        <Button type="submit" variant="destructive" size="sm" disabled={selectedCount === 0} >
          {submitText}
        </Button>
      </div>
      
      {children}     {/* Render the table (or any children) passed to the BulkForm component, stays as server-component */}
    </form>
  );
}
