import * as React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={`border rounded-md p-2 ${className || ""}`}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea"; 