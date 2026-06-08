import { Building2, BookOpen, Layers, Users, CalendarDays } from "lucide-react";

export const SETUP_STEPS = [
  { key: "campuses", label: "Add Campuses", desc: "Configure school branches and locations", icon: Building2 },
  { key: "subjects", label: "Define Subjects", desc: "Set up your curriculum catalog", icon: BookOpen },
  { key: "sections", label: "Create Sections", desc: "Organize classes by grade and campus", icon: Layers },
  { key: "students", label: "Enroll Students", desc: "Register your first student records", icon: Users },
  { key: "timetable", label: "Build Timetable", desc: "Schedule weekly class periods", icon: CalendarDays },
];

export function isStepDone(key, counts) {
  if (key === "students") return counts.students > 0;
  return counts[key] > 0;
}

export function isSetupComplete(counts) {
  return SETUP_STEPS.every((step) => isStepDone(step.key, counts));
}

export function getSetupProgress(counts) {
  const done = SETUP_STEPS.filter((step) => isStepDone(step.key, counts)).length;
  return { done, total: SETUP_STEPS.length, percent: Math.round((done / SETUP_STEPS.length) * 100) };
}
