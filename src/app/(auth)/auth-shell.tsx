import Link from "next/link";
import "./auth.css";

export function AuthShell({
  title,
  description,
  active,
  children
}: {
  title: string;
  description: string;
  active?: "login" | "register";
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <a className="brand" href="/">
          ShortVideoAuto
        </a>
        <div className="auth-card">
          <div>
            <h1>{title}</h1>
            <p className="lead">{description}</p>
          </div>
          {active ? (
            <nav className="auth-tabs" aria-label="Auth">
              <Link href="/login" aria-current={active === "login" ? "page" : undefined}>
                Dang nhap
              </Link>
              <Link href="/register" aria-current={active === "register" ? "page" : undefined}>
                Dang ky
              </Link>
            </nav>
          ) : null}
          {children}
        </div>
      </section>
      <aside className="auth-side">
        <h2>Tao video affiliate tieng Viet nhanh hon</h2>
        <p className="lead">Tai khoan giu job, credit, video da render va lich su thanh toan ngan nap.</p>
      </aside>
    </main>
  );
}
