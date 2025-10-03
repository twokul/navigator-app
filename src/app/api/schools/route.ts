import { NextResponse } from "next/server";
import { School } from "@/components/schools/columns";

// This could be replaced with a real database call or external API
async function fetchSchools(): Promise<School[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    {
      id: "1",
      name: "University of Alabama School of Dentistry",
      city: "Birmingham",
      state: "Alabama",
      programs: ["Orthodontics", "Periodontics", "Pediatric Dentistry", "Prosthodontics"],
      status: ["Citizens & Residents", "Non-Residents"],
      website: "https://www.uab.edu",
    },
    {
      id: "2",
      name: "Arizona School of Dentistry & Oral Health",
      city: "Mesa",
      state: "Arizona",
      programs: ["Dental Public Health"],
      status: ["Non-Residents"],
      website: "https://www.atsu.edu/arizona-school-of-dentistry-and-oral-health",
    },
    // Add more schools here or fetch from external API
  ];
}

export async function GET() {
  try {
    const schools = await fetchSchools();
    return NextResponse.json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
  }
}
