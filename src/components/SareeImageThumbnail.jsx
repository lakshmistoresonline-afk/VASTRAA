import React, { useState, useEffect } from 'react';
import { getSafeSareeImage } from '../services/googlePhotosService';

function SareeImageThumbnail({ src, alt, id, className, onClick, style, title }) {
  const [imgSrc, setImgSrc] = useState(src || getSafeSareeImage(id));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || getSafeSareeImage(id));
    setHasError(false);
  }, [src, id]);

  const handleError = () => {
    const fallback = getSafeSareeImage(id, imgSrc);
    if (fallback && fallback !== imgSrc) {
      setImgSrc(fallback);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !imgSrc) {
    return null;
  }

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
