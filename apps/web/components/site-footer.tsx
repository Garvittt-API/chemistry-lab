import { GitBranch, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-kicker">Virtual Chemistry Lab</p>
          <p className="footer-copy">
            A foundation for clear, accessible and scientifically responsible chemistry learning.
          </p>
        </div>
        <div>
          <p className="footer-heading">Explore</p>
          <Link href="/explore">Experiments</Link>
          <Link href="/subjects">Subjects</Link>
          <Link href="/about">About the project</Link>
        </div>
        <div>
          <p className="footer-heading">Project notes</p>
          <Link href="/help">Help and guidance</Link>
          <Link href="/settings">Settings</Link>
          <span className="footer-note">
            <ShieldCheck size={15} aria-hidden="true" />
            Phase 02 foundation
          </span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Temporary project identity · No simulations are available yet.</span>
        <span className="footer-provenance">
          <GitBranch size={15} aria-hidden="true" />
          Private development repository
        </span>
      </div>
    </footer>
  );
}
