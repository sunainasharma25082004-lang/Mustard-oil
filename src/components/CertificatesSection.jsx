import { useEffect, useState } from 'react';
import { contentApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';
import '../styles/main.css';
import '../styles/certificates.css';

function CertificatesSection({ items }) {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    if (items !== undefined) {
      setCertificates(Array.isArray(items) ? items : []);
    }
  }, [items]);

  useEffect(() => {
    if (items !== undefined) return undefined;
    contentApi
      .getCertificates()
      .then((res) => setCertificates(res.data || []))
      .catch(() => setCertificates([]));
    return undefined;
  }, [items]);

  if (items === undefined) return null;
  if (certificates.length === 0) return null;

  return (
    <section className="certificates-section" id="certifications">
      <div className="container">
        <div className="section-title">
          <span>Trust &amp; Quality</span>
          <h2>Our Certifications</h2>
        </div>
        <div className="certificates-grid">
          {certificates.map((cert) => (
            <article className="certificate-card" key={cert._id}>
              <div className="certificate-image-wrap">
                <img src={resolveImageUrl(cert.image)} alt={cert.title} loading="lazy" />
              </div>
              <div>
                <h3>{cert.title}</h3>
                {cert.description && <p>{cert.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CertificatesSection;