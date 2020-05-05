import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts'
import HeroPost from '../components/hero-post'
import MorePosts from '../components/more-posts'

export default function Archives({ allPostsData }) {
  const morePosts = allPostsData

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <h2>Archived Posts</h2>
      {morePosts.length > 0 && <MorePosts posts={morePosts} />}
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