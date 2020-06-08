import Head from 'next/head'
import Layout from '../../components/layout'
import { getAllPostIds, getPostData } from '../../lib/posts'
import Date from '../../components/date'
import utilStyles from '../../styles/utils.module.css'
import CoverImage from '../../components/cover-image'

export default function Post({ postData }) {
  return (
    <>
      <Layout>
        <Head>
          <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.2/styles/railscasts.min.css"></link>
          <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.2/highlight.min.js"></script>
          <title>{postData.title}</title>
          {postData.ogImage && (
            <>
              <meta property="og:image" content="https://bilk0h.com/{postData.ogImage.url}" />
            </>
          )}
        </Head>
        <article>
          {postData.coverImage && (
            <div className="mb-8 md:mb-16 -mx-5 sm:mx-0">
              <CoverImage title={postData.title} src={postData.coverImage} />
            </div>
          )}
          <div className={utilStyles.lightText}>
            <Date dateString={postData.date} />
          </div>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </Layout>
    </>
  )
}

export async function getStaticPaths() {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id)
  return {
    props: {
      postData
    }
  }
}