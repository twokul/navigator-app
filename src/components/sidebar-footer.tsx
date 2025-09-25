"use client";

import { CircleUserRound, LogOut, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

export default function SidebarFooter() {
  const { user } = useKindeAuth();

  return (
    <div className="text-fd-foreground hover:text-fd-accent-foreground/80 bottom-4 left-4 flex cursor-pointer pt-2 transition-colors hover:transition-none md:absolute md:pt-0">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex cursor-pointer flex-row items-center gap-2">
            <CircleUserRound className="size-4" />
            <span>
              {user?.given_name} {user?.family_name}
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <div className="flex h-full w-full flex-row items-center gap-2">
              <UserRound className="size-4" />
              <span>{user?.email}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="flex h-full w-full cursor-pointer flex-row items-center gap-2">
              <LogOut className="size-4" />
              <LogoutLink>Logout</LogoutLink>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
