import React, { useState, useEffect } from 'react';

function SareeImageThumbnail({ src, alt, id, className, onClick, style, title }) {
  const [imgSrc, setImgSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || '');
    setHasError(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError || !imgSrc) {
    return (
      <div
        onClick={onClick}
        className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold p-4 text-center`}
      >
        <span>Image Not Available</span>
      </div>
    );
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
