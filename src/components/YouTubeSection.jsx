import { useEffect, useState } from 'react';
import { contentApi } from '../utils/api';
import '../styles/testimonials.css';

function YouTubeSection({ items }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (items !== undefined) {
      setVideos(Array.isArray(items) ? items : []);
    }
  }, [items]);

  useEffect(() => {
    if (items !== undefined) return undefined;
    contentApi
      .getYouTubeVideos()
      .then((res) => setVideos(res.data || []))
      .catch(() => setVideos([]));
    return undefined;
  }, [items]);

  if (items === undefined) return null;
  if (videos.length === 0) return null;

  return (
    <section className="youtube-section" id="videos">
      <div className="container">
        <span className="small-heading">WATCH & LEARN</span>
        <h2>Our Story in Motion</h2>
        <div className="youtube-grid">
          {videos.map((video) => (
            <div className="youtube-card" key={video._id}>
              <div className="youtube-embed-wrap">
                <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title || 'Karyor Mustard Oil'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              {video.title && <h3>{video.title}</h3>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default YouTubeSection;