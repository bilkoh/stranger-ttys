import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts'
import Link from 'next/link'
import Date from '../components/date'
import HeroPost from '../components/hero-post'
import MorePosts from '../components/more-posts'

export default function Home({ allPostsData }) {
  const heroPost = allPostsData[0]
  const morePosts = allPostsData.slice(1)

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      {heroPost && (
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          id={heroPost.id}
          excerpt={heroPost.excerpt}
        />
      )}

      <h2>More Posts</h2>
      {morePosts.length > 0 && <MorePosts posts={morePosts} extended={1} />}
    </Layout>
  )
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}