import { Building2, BookOpen, Layers, GraduationCap, CalendarDays } from "lucide-react";

export const SETUP_STEPS = [
  { key: "campuses", label: "Add Campuses", desc: "Configure school branches and locations", icon: Building2 },
  { key: "subjects", label: "Define Subjects", desc: "Set up your curriculum catalog", icon: BookOpen },
  { key: "classes", label: "Add Class", desc: "Create grade classes (e.g. Class 9, Class 10)", icon: GraduationCap },
  { key: "sections", label: "Add Class Section", desc: "Add sections per class (e.g. 9-A, 9-B)", icon: Layers },
  { key: "timetable", label: "Build Timetable", desc: "Schedule weekly class periods", icon: CalendarDays },
];

export function isStepDone(key, counts) {
  return (counts[key] ?? 0) > 0;
}

export function isSetupComplete(counts) {
  return SETUP_STEPS.every((step) => isStepDone(step.key, counts));
}

export function getSetupProgress(counts) {
  const done = SETUP_STEPS.filter((step) => isStepDone(step.key, counts)).length;
  return { done, total: SETUP_STEPS.length, percent: Math.round((done / SETUP_STEPS.length) * 100) };
}

export function isStepUnlocked(stepKey, counts) {
  const idx = SETUP_STEPS.findIndex((s) => s.key === stepKey);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    if (!isStepDone(SETUP_STEPS[i].key, counts)) return false;
  }
  return true;
}

export function getStepPath(stepKey) {
  return `/setup/${stepKey}`;
}

export function getStepByKey(stepKey) {
  return SETUP_STEPS.find((s) => s.key === stepKey);
}
