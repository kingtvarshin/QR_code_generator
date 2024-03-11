import Link from 'next/link'
import styles from './page.module.css'

export default function Page() {
  return (
      <Link href="/test" className={`${styles.center} ${styles.card}`}>
        Dashboard
      </Link>
    )
}
