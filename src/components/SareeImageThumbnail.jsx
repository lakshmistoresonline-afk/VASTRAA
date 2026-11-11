import React, { useState, useEffect } from 'react';

function SareeImageThumbnail({ src, alt, id, className, onClick, style, title, onError }) {
  const [imgSrc, setImgSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || '');
    setHasError(false);
  }, [src]);

  const handleImgError = () => {
    setHasError(true);
    if (onError) onError();
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
      onError={handleImgError}
      className={className}
      loading="lazy"
    />
  );
}

export default SareeImageThumbnail;
