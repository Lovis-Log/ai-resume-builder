import type { ReactNode } from "react";

export function PanelHeader({
  eyebrow,
  title,
  description,
  aside,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="studio-panel-header">
      <div className="studio-panel-heading-row">
        <p className="app-eyebrow">
          <span aria-hidden="true" />
          {eyebrow}
        </p>
        {aside}
      </div>
      <h1>{title}</h1>
      <p className="studio-panel-description">{description}</p>
      {children}
    </header>
  );
}
