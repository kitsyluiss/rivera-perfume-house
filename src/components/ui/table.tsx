import * as React from "react";

export function Table({ className = "", ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={["w-full caption-bottom text-sm", className].join(" ")} {...props} />;
}

export function TableHeader({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={["[&_tr]:border-b", className].join(" ")} {...props} />;
}

export function TableBody({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={["[&_tr:last-child]:border-0", className].join(" ")} {...props} />;
}

export function TableRow({ className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={["border-b border-border transition-colors hover:bg-secondary/40", className].join(" ")} {...props} />;
}

export function TableHead({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={["h-12 px-4 text-left align-middle font-medium text-muted-foreground", className].join(" ")} {...props} />;
}

export function TableCell({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={["p-4 align-middle", className].join(" ")} {...props} />;
}