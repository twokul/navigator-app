"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ExternalLink } from "lucide-react";

export type School = {
  id: string;
  name: string;
  city: string;
  state: string;
  programs: string[];
  status: string[];
  website: string;
};

export const columns: ColumnDef<School>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "city",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "programs",
    header: "Programs",
    cell: ({ row }) => {
      const programs = row.getValue("programs") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {programs.slice(0, 2).map((program, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {program}
            </Badge>
          ))}
          {programs.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{programs.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statuses = row.getValue("status") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {statuses.map((status, index) => (
            <Badge
              key={index}
              variant={status === "Citizens & Residents" ? "default" : "outline"}
              className="text-xs"
            >
              {status}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const website = row.getValue("website") as string;
      return (
        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            Visit
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      );
    },
  },
];
