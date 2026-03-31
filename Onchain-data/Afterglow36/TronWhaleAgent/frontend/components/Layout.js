import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>TRON Whale Agent</div>
        <nav style={styles.nav}>
          <Link href="/" style={styles.link}>Whale Dashboard</Link>
          <Link href="/address" style={styles.link}>Address Intelligence</Link>
          <Link href="/query" style={styles.link}>AI Query</Link>
        </nav>
      </aside>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    background: "#0b1020",
    color: "#e5e7eb",
    fontFamily: "Inter, Arial, sans-serif",
  },
  sidebar: {
    width: 240,
    borderRight: "1px solid #1f2937",
    padding: 24,
    background: "#111827",
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 24,
    color: "#f9fafb",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: 10,
    background: "#1f2937",
  },
  main: {
    flex: 1,
    padding: 28,
  },
};
