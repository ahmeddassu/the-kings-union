import { profileHref } from "@/lib/people";

// Wraps a person's card in a link to their profile, if they have one.
export default function ProfileLink({ name, className = "", children }) {
  const href = profileHref(name);
  if (!href) return <div className={className}>{children}</div>;
  return (
    <a href={href} className={`group block ${className}`} aria-label={`${name}: profile`}>
      {children}
    </a>
  );
}
