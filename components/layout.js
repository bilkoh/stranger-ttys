import Head from 'next/head'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'

const name = 'bilk0h'
export const siteTitle = 'Stranger TTYs'

export default function Layout({ children, home }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css?family=Bree+Serif|Inconsolata|Open+Sans|Share+Tech+Mono|Zilla+Slab+Highlight:400,700|Zilla+Slab:400,700|Montserrat:400" rel="stylesheet"></link>
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />

        <script>var clicky_site_ids = clicky_site_ids || []; clicky_site_ids.push(101260088);</script>
        <script async src="//static.getclicky.com/js"></script>
      </Head>
      <section className="wrapper">
        <main className="content">
          <header>
            <ul className="nav">
              <li className="nav-item nav-item-active"><a href="/">Home</a></li>
              <li className="nav-item"><a href="/archive">Archive</a></li>
              <li className="nav-item"><a href="https://github.com/bilkoh">Github</a></li>
              <li className="nav-item"><a href="https://twitter.com/bilkohsec">Twitter</a></li>
              <li className="nav-item"><a href="https://www.linkedin.com/in/bilal-kohgadai/">LinkedIn</a></li>
            </ul>
          </header>

          <div className="children">
            {children}
          </div>

          {!home && (
            <div className={styles.backToHome}>
              <Link href="/">
                <a>← Back to home</a>
              </Link>
            </div>
          )}
        </main>
        <aside>
          <section className="aboutme">
            <h1>Stranger TTYs</h1>
            <p>
              <u>My name is bilk0h.</u> I'm a security enthusiast, linux users, programmer, and a big fan of virtual machines. This blog documents my activities in those spaces that might be a contribution to others.
            </p>
          </section>
        </aside>
      </section>
    </>
  )
}