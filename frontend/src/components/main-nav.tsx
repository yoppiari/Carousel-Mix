import * as React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "./ui/button";
import { EditorMenubar } from "./editor-menubar";
import { Download, Loader2Icon, Settings } from "lucide-react";
import Pager from "./pager";
import { FilenameForm } from "./forms/filename-form";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type MainNavItem = NavItem;

interface MainNavProps {
  handlePrint: () => void;
  isPrinting: boolean;
  className?: string;
}

export function MainNav({ handlePrint, isPrinting, className }: MainNavProps) {
  return (
    <div
      className={cn(
        "flex gap-4 md:gap-10 justify-between items-center",
        className
      )}
    >
      <div className="flex gap-4">
        <Link href="/" className="items-center space-x-2 flex">
          <Icons.logo />
          <span className="hidden font-bold md:inline-block">
            Carousel Generator Pro
          </span>
        </Link>
        <EditorMenubar />
      </div>
      <div className="hidden lg:block">
        <Pager />
      </div>
      <div className="flex gap-2 items-center">
        <div className="hidden md:block">
          <FilenameForm />
        </div>
        <Button variant="ghost" size={"icon"} onClick={handlePrint}>
          <div className="flex flex-row gap-1 items-center">
            {isPrinting ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <Download />
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}