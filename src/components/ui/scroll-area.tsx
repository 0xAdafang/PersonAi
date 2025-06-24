import * as React from "react";

export const ScrollArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overflow-y-auto max-h-full pr-2">
      {children}
    </div>
  );
};
