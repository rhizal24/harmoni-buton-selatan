import Link from "next/link";

interface ProfileIconProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

function PersonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={22}
      height={22}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

const baseClasses =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant no-underline cursor-pointer motion-safe:transition-colors motion-safe:duration-150 hover:bg-primary-container hover:text-on-primary-container hover:border-primary";

export function ProfileIcon({
  href = "/admin/login",
  onClick,
  className = "",
}: ProfileIconProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${className}`}
        aria-label="Buka halaman profil / Admin"
      >
        <PersonIcon />
        <span className="sr-only">Profil / Admin</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      aria-label="Buka profil"
    >
      <PersonIcon />
      <span className="sr-only">Profil</span>
    </button>
  );
}
