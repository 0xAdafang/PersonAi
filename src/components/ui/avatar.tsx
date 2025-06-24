import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const avatarVariants = cva("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full");

export function Avatar({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(avatarVariants(), className)}>{children}</div>;
}

export function AvatarImage({ src }: { src: string }) {
  return <img src={src} alt="" className="object-cover w-full h-full" />;
}

export function AvatarFallback({ children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm font-medium">
      {children}
    </div>
  );
}
