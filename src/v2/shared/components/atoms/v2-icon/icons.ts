/**
 * V2 Icon Registry & Re-export Hub
 *
 * Single source of truth for all icons in V2 design system.
 * All icons from underlying libraries (e.g. lucide-react) must be imported here
 * and re-exported under V2 atoms.
 */
import type { LucideIcon, LucideProps } from "lucide-react";

export type V2IconType = LucideIcon;
export type V2IconPropsBase = LucideProps;

// Re-export core Lucide types
export type { LucideIcon, LucideProps };

// Re-export common icon set used across ERP Shell, Layout, and Modules
export {
  LayoutDashboard,
  Boxes,
  Users,
  FileText,
  Building2,
  Layers,
  Car,
  Network,
  Factory,
  Package,
  Barcode,
  ReceiptText,
  Shield,
  Target,
  PackageCheck,
  Wallet,
  Settings,
  UserSquare2,
  Paperclip,
  Mail,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Plus,
  Edit,
  Trash,
  ClipboardList,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Maximize,
  Minimize,
  RefreshCw,
  Globe,
  Languages,
  Sliders,
  Filter,
  Download,
  Upload,
  Printer,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Folder,
  FolderPlus,
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  ListFilter,
  Loader2,
  MoreHorizontal,
  MoreVertical,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";
