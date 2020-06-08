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
        <aside>
          <section className="aboutme">
            <h1>Stranger TTYs</h1>
            <p>
              <u>My name is bilk0h.</u> I was a seventeen year old hacker in the year 2000. I liked 0day, vulnerable IIS server, and competing with my irc rivals. I liked power. I liked it too much. One night, I stumbled upon a strange tty of unknown origins. Upon privilege escalation, my consciousness was sucked into an unknown cyberspace and I was disconnected from my body and lost to oblivion. But somehow I woke up, lost and confused, in the body of a thirty-six year old man in the year 2020. Now I'm on a mission to get back to the terminal where all this started. With my snarky robot sidekick, and a lot of catching up to do, I will stop at nothing.
              </p>
          </section>
        </aside>

        <main className="content">
          <header>
            <ul className="nav">
              <li className="nav-item nav-item-active"><a href="/">Home</a></li>
              <li className="nav-item"><a href="/archive">Archive</a></li>
              <li className="nav-item"><a href="https://github.com/bilkoh">Github</a></li>
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
      </section>
    </>
  )
}