import styles from "./styles.module.css";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className={styles.Header}>
      <section className={styles.Content}>
        <nav className={styles.nav}>
          <Link className={styles.link} href="/">
            <h1 className={styles.HeaderTitle}>
              Tarefas<span className={styles.cross}>+</span>
            </h1>
          </Link>
          {session?.user && (
            <Link href="/dashboard" className={styles.dashboardbutton}>
              Meu Painel
            </Link>
          )}
        </nav>
        {status === "loading" ? (
          <></>
        ) : session ? (
          <button className={styles.button} onClick={() => signOut()}>
            Olá {session?.user?.name}{""}
          </button>
        ) : (
          <button className={styles.button} onClick={() => signIn("google")}>
            Acessar
          </button>
        )}
      </section>
    </header>
  );
}
