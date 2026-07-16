import * as React from "react";

export type LabelProps = React.ComponentPropsWithoutRef<"label">;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={[
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        ].join(" ")}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";