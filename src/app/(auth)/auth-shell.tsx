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
                Đăng nhập
              </Link>
              <Link href="/register" aria-current={active === "register" ? "page" : undefined}>
                Đăng ký
              </Link>
            </nav>
          ) : null}
          {children}
        </div>
      </section>
      <aside className="auth-side">
        <h2>Tạo video affiliate tiếng Việt nhanh hơn</h2>
        <p className="lead">Tài khoản giữ job, credit, video đã render và lịch sử thanh toán ngăn nắp.</p>
      </aside>
    </main>
  );
}
