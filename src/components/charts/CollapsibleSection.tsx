"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({
  label,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-forest hover:text-forest-hover transition-colors mb-3"
      >
        <i
          className={
            "fas fa-chevron-right text-[10px] transition-transform " +
            (open ? "rotate-90" : "")
          }
        />
        {label}
      </button>
      {open && children}
    </div>
  );
}
