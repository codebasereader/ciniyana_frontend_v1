import { useState } from 'react'
import { FaPlay } from 'react-icons/fa'
import { getYouTubeEmbedUrl } from '../../lib/youtube'

/**
 * Click-to-play YouTube facade — the iframe (and YouTube's own JS) only
 * loads once a viewer actually presses play, not on every page view.
 */
export default function VideoPlayer({ youtubeId, thumbnail, title }) {
  const [playing, setPlaying] = useState(false)

  if (!youtubeId) return null

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={getYouTubeEmbedUrl(youtubeId, { autoplay: true })}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group relative block aspect-video w-full overflow-hidden bg-black"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff0000] text-white shadow-lg transition group-hover:scale-105 sm:h-20 sm:w-20">
          <FaPlay className="ml-1 text-2xl sm:text-3xl" aria-hidden="true" />
        </span>
      </span>
    </button>
  )
}
