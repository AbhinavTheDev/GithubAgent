import * as React from "react";

import { cn } from "../../libs/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:m-0.5  [&::-webkit-scrollbar-track]:rounded-lg  [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20 max-h-64",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
