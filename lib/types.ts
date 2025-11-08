import { iconMap } from "@/components/process-steps";

export interface Demo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "chatbot" | "landing";
  gradient: string;
  preview: React.ReactNode;
}

export interface Step {
  title: string;
  icon: keyof typeof iconMap;
  description: string;
}

export interface Theme {
  background?: string;
  highlight?: string;
  secondary?: string;
  text?: string;
  cardBackground?: string;
}

export interface ProcessStepsProps {
  title: string;
  steps: Step[];
  layout?: "horizontal" | "vertical";
  theme?: Theme;
  className?: string;
}

export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string[];
  technologies: string[];
}
