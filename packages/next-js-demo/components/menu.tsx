"use client";
import { Button } from "@/components/ui/button";
import { FileTextIcon, ZapIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export const Menu = () => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav>
      <Button
        variant={
          pathname === "/" || pathname.startsWith("/blog-post")
            ? "default"
            : "ghost"
        }
        className="w-full justify-start mb-2"
        onClick={() => router.push("/")}
      >
        <FileTextIcon className="mr-2 h-4 w-4" />
        Posts
      </Button>
      <Button
        variant={pathname.startsWith("/automation") ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => router.push("/automation")}
      >
        <ZapIcon className="mr-2 h-4 w-4" />
        Automation
      </Button>
    </nav>
  );
};
