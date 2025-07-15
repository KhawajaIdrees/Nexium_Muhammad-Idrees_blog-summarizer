import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={`border rounded-md p-2 ${className || ""}`}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea"; 