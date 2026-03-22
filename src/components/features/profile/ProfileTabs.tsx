"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FullProfile, ProfileCompleteness } from "@/types";
import { getProfileCompleteness } from "@/types";
import { ExperienceTab } from "./ExperienceTab";
import { ProjectsTab } from "./ProjectsTab";
import { InternshipTab } from "./InternshipTab";
import { AcademicTab } from "./AcademicTab";
import { ExtraCurricularTab } from "./ExtraCurricularTab";
import { CodeChefTab } from "./CodeChefTab";
import { MiscTab } from "./MiscTab";
import {
  Briefcase,
  FolderOpen,
  GraduationCap,
  BookOpen,
  Award,
  Code,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

type TabDef = {
  key: keyof ProfileCompleteness;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  component: React.ComponentType<{ profile: FullProfile }>;
};

const TABS: TabDef[] = [
  { key: "experience", label: "Experience", shortLabel: "Exp", icon: Briefcase, component: ExperienceTab },
  { key: "projects", label: "Projects", shortLabel: "Projects", icon: FolderOpen, component: ProjectsTab },
  { key: "internship", label: "Internship", shortLabel: "Intern", icon: GraduationCap, component: InternshipTab },
  { key: "academic", label: "Academic", shortLabel: "Edu", icon: BookOpen, component: AcademicTab },
  { key: "extraCurricular", label: "Extra Curricular", shortLabel: "Extra", icon: Award, component: ExtraCurricularTab },
  { key: "codechef", label: "CodeChef", shortLabel: "CodeChef", icon: Code, component: CodeChefTab },
];

const triggerClass = `
  flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium
  text-muted-foreground transition-colors
  hover:text-foreground hover:bg-accent
  data-[state=active]:text-primary-foreground
  data-[state=active]:bg-primary
  data-[state=active]:shadow-sm
  sm:text-sm
`;

export function ProfileTabs({ profile }: { profile: FullProfile }) {
  const completeness = getProfileCompleteness(profile);
  const hasMisc = Array.isArray(profile.miscData) && (profile.miscData as unknown[]).length > 0;

  const allEmpty = Object.values(completeness).every((v) => !v);
  const visibleTabs = TABS.filter((t) => allEmpty || completeness[t.key]);
  const defaultTab = visibleTabs[0]?.key ?? (hasMisc ? "misc" : "experience");

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="flex h-auto flex-wrap gap-1 rounded-lg bg-muted p-1">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.key} value={tab.key} className={triggerClass}>
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </TabsTrigger>
          );
        })}
        {hasMisc && (
          <TabsTrigger value="misc" className={triggerClass}>
            <MoreHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Additional Info</span>
            <span className="sm:hidden">More</span>
          </TabsTrigger>
        )}
      </TabsList>

      {visibleTabs.map((tab) => {
        const Component = tab.component;
        return (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            <Component profile={profile} />
          </TabsContent>
        );
      })}
      {hasMisc && (
        <TabsContent value="misc" className="mt-4">
          <MiscTab miscData={profile.miscData as { title: string; items: string[] }[]} />
        </TabsContent>
      )}
    </Tabs>
  );
}
