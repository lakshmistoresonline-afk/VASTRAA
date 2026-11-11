import React, { useState, useEffect } from 'react';

function SareeImageThumbnail({ src, alt, id, className, onClick, style, title }) {
  const [imgSrc, setImgSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || '');
    setHasError(false);
  }, [src]);

  if (hasError || !imgSrc) {
    return null; // Omit card if image is missing or fails to load
  }

  return (
    <img
      src={imgSrc}
      alt={alt || 'Saree'}
      title={title}
      onClick={onClick}
      style={style}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}

export default SareeImageThumbnail;
