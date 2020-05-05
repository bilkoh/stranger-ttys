import Date from '../components/date'
import CoverImage from './cover-image'
import Link from 'next/link'
import utilStyles from '../styles/utils.module.css'

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  id,
  extended
}) {
  return (
    <>
    <div className="PostPreview">
      
    {extended ? (
      <>
      <div className="extended">
        {coverImage && (
          <CoverImage id={id} title={title} src={coverImage} />
        )}
        <h3>
          <Link as={`/posts/${id}`} href="/posts/[id]">
            <a>{title}</a>
          </Link>
        </h3>
        <small className={utilStyles.lightText}><Date dateString={date} /></small>
        <p>{excerpt}</p>
      </div>
      </>
    ) : (
      <>
      {/* <div>
        <h4>
          <Link as={`/posts/${id}`} href="/posts/[id]">
            <a>{title} - <Date dateString={date} /></a>
          </Link>
        </h4>
        <p><small>{excerpt}</small></p>
      </div> */}
        <li>
          <Link as={`/posts/${id}`} href="/posts/[id]"><a>{title} - <Date dateString={date} /></a></Link>
        </li>
      </>
    )}
    
    <style jsx>{`
      .extended {
        margin-bottom: 5em;
        border-bottom 1px solid #EFCC57;
      }
      h3 {
        margin: 0;
      }
    `}</style>
    
    </div>
    </>
  )
}