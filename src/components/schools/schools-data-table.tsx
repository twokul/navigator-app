"use client";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getSchoolsDirect } from "@/lib/schools";
import { useEffect, useState, useMemo } from "react";
import { School } from "./columns";
import { FacetedFilterOption } from "./data-table-faceted-filter";
import { Users, GraduationCap, MapPin } from "lucide-react";

export function SchoolsDataTable() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await getSchoolsDirect();
        setSchools(data);
      } catch (error) {
        console.error("Error fetching schools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Generate filter options from schools data
  const statusOptions: FacetedFilterOption[] = useMemo(() => {
    const statusSet = new Set<string>();
    schools.forEach((school) => {
      school.status?.forEach((status) => statusSet.add(status));
    });
    return Array.from(statusSet).map((status) => ({
      label: status,
      value: status,
      icon: Users,
    }));
  }, [schools]);

  const programOptions: FacetedFilterOption[] = useMemo(() => {
    const programSet = new Set<string>();
    schools.forEach((school) => {
      school.programs?.forEach((program) => programSet.add(program));
    });
    return Array.from(programSet).map((program) => ({
      label: program,
      value: program,
      icon: GraduationCap,
    }));
  }, [schools]);

  const stateOptions: FacetedFilterOption[] = useMemo(() => {
    const stateSet = new Set<string>();
    schools.forEach((school) => {
      if (school.state) {
        stateSet.add(school.state);
      }
    });
    return Array.from(stateSet)
      .sort()
      .map((state) => ({
        label: state,
        value: state,
        icon: MapPin,
      }));
  }, [schools]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-muted-foreground">Loading schools...</div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={schools}
      stateOptions={stateOptions}
      statusOptions={statusOptions}
      programOptions={programOptions}
    />
  );
}
