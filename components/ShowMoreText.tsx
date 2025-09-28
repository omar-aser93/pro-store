'use client';
import { useState } from "react";

// A simple component to show a truncated text with a "Show more" / "Show less" toggle button, receives the text and maxLength (default 150) as props
export default function ShowMoreText({ text, maxLength = 150, className = "", buttonClassName = ""}: { text: string; maxLength?: number; className?: string; buttonClassName?: string; }) {

  const [expanded, setExpanded] = useState(false);         // State to track if the text is expanded or truncated

  // Function to toggle the expanded state
  const toggleExpanded = () => setExpanded((prev) => !prev);
  // Check if the text exceeds the maxLength
  const isTruncated = text.length > maxLength;

  if (!text) return null;                                 // If no text is provided, render nothing

  return (
    <div className={className}>
      <p className="whitespace-pre-wrap">
        {expanded || !isTruncated ? text : text.slice(0, maxLength) + "…"}
      </p>
      {isTruncated && (
        <button onClick={toggleExpanded} className={`text-blue-600 hover:underline mt-2 ${buttonClassName}`}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
