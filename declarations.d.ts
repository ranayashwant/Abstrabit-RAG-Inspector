declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type LucideIcon = React.FC<LucideProps>;

  export const Sparkles: LucideIcon;
  export const Terminal: LucideIcon;
  export const Moon: LucideIcon;
  export const Sun: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Play: LucideIcon;
  export const RotateCw: LucideIcon;
  export const FileText: LucideIcon;
  export const Search: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const XCircle: LucideIcon;
  export const Clock: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const AlertOctagon: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const Layers: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const BookmarkCheck: LucideIcon;
  export const Bot: LucideIcon;
  export const FileCode: LucideIcon;
  export const Copy: LucideIcon;
  export const Check: LucideIcon;
  export const Wrench: LucideIcon;
  export const Activity: LucideIcon;
  export const X: LucideIcon;
  export const Code: LucideIcon;
  export const Shield: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Info: LucideIcon;
  export const ChevronDown: LucideIcon;
}
