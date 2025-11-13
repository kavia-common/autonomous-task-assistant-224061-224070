import React from "react";
import "./button.css";

/**
 * PUBLIC_INTERFACE
 * Button - primary/secondary/ghost variants with sizes.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
  ariaLabel,
}) {
  const cls = `btn btn-${variant} btn-${size}`;
  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
