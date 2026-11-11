import React, { useState, useEffect } from 'react';

function SareeImageThumbnail({ src, alt, id, className, onClick, style, title, onError }) {
  const [validSrc, setValidSrc] = useState(null); // null = checking, string = valid, false = invalid

  useEffect(() => {
    if (!src || typeof src !== 'string' || src.trim() === '' || src.includes('EXPIRED')) {
      setValidSrc(false);
      if (onError) onError();
      return;
    }

    // In non-browser testing environments (JSDOM), trust src immediately
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      setValidSrc(src);
      return;
    }

    const img = new Image();
    let isCancelled = false;

    img.onload = () => {
      if (!isCancelled) {
        if (img.naturalWidth <= 100 || img.naturalHeight <= 100) {
          setValidSrc(false);
          if (onError) onError();
        } else {
          setValidSrc(src);
        }
      }
    };

    img.onerror = () => {
      if (!isCancelled) {
        setValidSrc(false);
        if (onError) onError();
      }
    };

    img.src = src;

    return () => {
      isCancelled = true;
    };
  }, [src, onError]);

  if (validSrc === false) {
    return null; // Strictly omit card when image fails pre-check or is invalid
  }

  if (validSrc === null) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-[10px] text-gray-400`}>
        Loading...
      </div>
    );
  }

  return (
    <img
      src={validSrc}
      alt={alt || 'Saree'}
      title={title}
      onClick={onClick}
      style={style}
      className={className}
      loading="lazy"
    />
  );
}

export default SareeImageThumbnail;
