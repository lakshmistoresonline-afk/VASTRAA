import React, { useState, useEffect } from 'react';
import { getSafeSareeImage } from '../services/googlePhotosService';

function SareeImageThumbnail({ src, alt, id, className, onClick, style, title }) {
  const [imgSrc, setImgSrc] = useState(src || getSafeSareeImage(id));

  useEffect(() => {
    setImgSrc(src || getSafeSareeImage(id));
  }, [src, id]);

  const handleError = () => {
    const fallback = getSafeSareeImage(id);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Saree'}
      title={title}
      onClick={onClick}
      style={style}
      onError={handleError}
      className={className}
      loading="lazy"
    />
  );
}

export default SareeImageThumbnail;
