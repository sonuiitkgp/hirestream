import type {
  User,
  Profile,
  Experience,
  Project,
  Internship,
  AcademicBackground,
  ExtraCurricular,
  CodeChefProfile,
} from "@prisma/client";

// Full profile with all sections
export type FullProfile = Profile & {
  user: Pick<User, "id" | "name" | "email" | "image" | "role">;
  experiences: Experience[];
  projects: Project[];
  internships: Internship[];
  academicBgs: AcademicBackground[];
  extraCurriculars: ExtraCurricular[];
  codechefProfile: CodeChefProfile | null;
};

// Section completeness check — determines which tabs to show
export type ProfileCompleteness = {
  experience: boolean;
  projects: boolean;
  internship: boolean;
  academic: boolean;
  extraCurricular: boolean;
  codechef: boolean;
};

export function getProfileCompleteness(profile: FullProfile): ProfileCompleteness {
  return {
    experience: profile.experiences.length > 0,
    projects: profile.projects.length > 0,
    internship: profile.internships.length > 0,
    academic: profile.academicBgs.length > 0,
    extraCurricular: profile.extraCurriculars.length > 0,
    codechef: profile.codechefProfile !== null,
  };
}

// Parsed resume structure returned by Gemini
export type ParsedResume = {
  headline?: string;
  bio?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  experiences?: Omit<Experience, "id" | "profileId" | "createdAt">[];
  projects?: Omit<Project, "id" | "profileId" | "createdAt">[];
  internships?: Omit<Internship, "id" | "profileId" | "createdAt">[];
  academicBgs?: Omit<AcademicBackground, "id" | "profileId" | "createdAt">[];
  extraCurriculars?: Omit<ExtraCurricular, "id" | "profileId" | "createdAt">[];
  codechef?: Omit<CodeChefProfile, "id" | "profileId" | "updatedAt"> | null;
};
