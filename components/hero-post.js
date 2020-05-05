import Date from '../components/date'
import CoverImage from '../components/cover-image'
import Link from 'next/link'
import utilStyles from '../styles/utils.module.css'

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  id,
}) {
  return (
    <>
    <section className="HeroPost">
      <CoverImage title={title} src={coverImage} id={id} />
      <div>
        <h3 >
          <Link as={`/posts/${id}`} href="/posts/[id]">
            <a>{title}</a>
          </Link>
        </h3>
        <div className={utilStyles.lightText}>
          <Date dateString={date} />
        </div>
      </div>
      <div>
        <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
      </div>
    </section>

    <style jsx>{`
      .HeroPost {
        margin-bottom: 5em;
      }
      h3 {
        margin: 0;
      }
    `}</style>
    </>
  )
}