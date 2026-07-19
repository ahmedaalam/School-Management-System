import { Search } from "lucide-react";

export default function PageHeader({ title, titleHighlight, subtitle, actions }) {
  return (
    <div className="page-header flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="page-title">
          {title} {titleHighlight && <span>{titleHighlight}</span>}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
