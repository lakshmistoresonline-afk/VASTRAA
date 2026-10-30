import React, { useState, useEffect } from 'react';
import { getSafeSareeImage, SAFE_SAREE_IMAGES } from '../services/googlePhotosService';

function SareeImageThumbnail({ src, alt, id, className, onClick, style, title }) {
  const [imgSrc, setImgSrc] = useState(src || getSafeSareeImage(id));

  useEffect(() => {
    setImgSrc(src || getSafeSareeImage(id));
  }, [src, id]);

  const handleError = () => {
    const fallback = getSafeSareeImage(id, imgSrc);
    if (imgSrc !== fallback && fallback) {
      setImgSrc(fallback);
    } else {
      // Ultimate safety shield: if fallback equals imgSrc, use safe default from pool
      const safeDefault = SAFE_SAREE_IMAGES[0] || "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";
      setImgSrc(safeDefault);
    }
  };

  const handleLoad = (e) => {
    // Detect Google Photos 403 grey minus error PNG (naturalDimensions <= 100px or error graphic)
    const img = e.target;
    if (img && imgSrc.includes('googleusercontent.com')) {
      if (img.naturalWidth <= 100 || img.naturalHeight <= 100) {
        handleError();
      }
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Saree'}
      title={title}
      onClick={onClick}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
      className={className}
      loading="lazy"
    />
  );
}

export default SareeImageThumbnail;
