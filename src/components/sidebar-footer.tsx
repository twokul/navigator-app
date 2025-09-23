import { CircleUserRound, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function SidebarFooter() {
  return (
    <div className="text-fd-foreground hover:text-fd-accent-foreground/80 bottom-4 left-4 flex cursor-pointer pt-2 transition-colors hover:transition-none md:absolute md:pt-0">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex cursor-pointer flex-row items-center gap-2">
            <CircleUserRound className="size-4" />
            <span>Sam Koch</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem>
            <Link href="/p">
              <div className="flex flex-row items-center gap-2">
                <UserRound className="size-4" />
                <span>Profile</span>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex flex-row items-center gap-2">
              <LogOut className="size-4" />
              <LogoutLink>Logout</LogoutLink>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
