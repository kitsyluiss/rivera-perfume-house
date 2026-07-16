import * as React from "react";

export function Separator({ className = "", ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={["shrink-0 border-t border-border", className].join(" ")} {...props} />;
}