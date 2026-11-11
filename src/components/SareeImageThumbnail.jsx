import React, { useState, useEffect } from 'react';

function SareeImageThumbnail({ src, alt, id, className, onClick, style, title, onError }) {
  const [imgSrc, setImgSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || '');
    setHasError(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  if (hasError || !imgSrc) {
    return null; // Strictly omit card when image is not present or fails to load
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
