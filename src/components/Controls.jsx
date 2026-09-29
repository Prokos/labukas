import {
  House,
  Route,
  Dumbbell,
  Search,
  Settings,
  X,
  Sprout,
  Cloud,
  RefreshCw,
  Archive,
  Download,
  Upload,
  ArrowRight,
} from "lucide-react";
const icons = {
  House,
  Route,
  Dumbbell,
  Search,
  Settings,
  X,
  Sprout,
  Cloud,
  RefreshCw,
  Archive,
  Download,
  Upload,
  ArrowRight,
};
export function Icon({ name, ...props }) {
  const Component = icons[name];
  return Component ? <Component size={22} {...props} /> : null;
}
export function Button({ secondary, children, ...props }) {
  return (
    <button className={`button${secondary ? " secondary" : ""}`} {...props}>
      {children}
    </button>
  );
}
export function PageHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
