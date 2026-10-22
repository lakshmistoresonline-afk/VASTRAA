import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import myContext from '../../context/data/myContext';
import { FiArrowRight, FiGrid } from 'react-icons/fi';
import extractedData from '../../data/extractedSarees.json';
import { CATALOGUES } from '../../data/catalogues';

const FALLBACK_IMG = 'https://lh3.googleusercontent.com/pw/AP1GczO5uQ7JjyrEhAQYwqx_rnj_gHyjFNRYd7tskFvyG_Nzdnb4r6E20YcRSW3AxSY8YUNfesFS9A7kfJdIf8Bhpnx5fNOfFQ-4OTLId8_mmjQAD_Zxf-Na=w1024-h1024';

const SILK_CATEGORIES = [
  {
    id: 'pure-wedding-silks',
    title: 'Pure Wedding Silks',
    subtitle: "Traditional weaves for life's special moments",
    images: [
      CATALOGUES[0].featuredImage,
      ...(extractedData.A || []).map(i => i.imageUrl)
    ].filter(Boolean),
    filterValue: 'Kanchipuram Pure Wedding Silk Sarees',
    startIndex: 0
  },
  {
    id: 'pure-fancy-silks',
    title: 'Pure Fancy Silks',
    subtitle: 'Elegant designs for every celebration',
    images: [
      CATALOGUES[1].featuredImage,
      ...(extractedData.B || []).map(i => i.imageUrl)
    ].filter(Boolean),
    filterValue: 'Kanchipuram Pure Fancy Silk Sarees',
    startIndex: 10
  },
  {
    id: 'pure-soft-silks',
    title: 'Pure Soft Silks',
    subtitle: 'Lightweight elegance for everyday grace',
    images: [
      CATALOGUES[2].featuredImage,
      ...(extractedData.C || []).map(i => i.imageUrl)
    ].filter(Boolean),
    filterValue: 'Kanchipuram Pure Soft Silk Sarees',
    startIndex: 20
  },
  {
    id: 'art-semi-silks',
    title: 'Art & Semi Silks',
    subtitle: 'Contemporary styles with timeless charm',
    images: [
      CATALOGUES[3].featuredImage,
      ...(extractedData.D || []).map(i => i.imageUrl),
      ...(extractedData.E || []).map(i => i.imageUrl),
      ...(extractedData.F || []).map(i => i.imageUrl)
    ].filter(Boolean),
    filterValue: 'Semi Silk Sarees',
    startIndex: 30
  }
];

function CategoryCard({ category, setFilterType }) {
  const images = category.images.length > 0 ? category.images : [FALLBACK_IMG];
  const [currentIndex, setCurrentIndex] = useState(category.startIndex % images.length);

  // Rotate saree image every 3.5 seconds independently and cleanly
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  const currentImage = images[currentIndex] || images[0];

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMG;
  };

  return (
    <Link
      to="/allproducts"
      onClick={() => setFilterType(category.filterValue)}
      className="group relative h-48 rounded-2xl overflow-hidden shadow-sm border border-[#E9E1D5] dark:border-gray-800 bg-white dark:bg-gray-900 flex items-end p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
    >
      <img
        key={currentImage}
        src={currentImage}
        alt={category.title}
        onError={handleImageError}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

      <div className="relative z-10 text-white space-y-1 w-full">
        <h3 className="font-serif font-bold text-lg text-amber-50 group-hover:text-[#C6A15B] transition-colors">
          {category.title}
        </h3>
        <p className="text-[11px] text-amber-100/80 font-normal line-clamp-1">
          {category.subtitle}
        </p>
        <div className="pt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#C6A15B]">
          <span>Explore Now</span>
          <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function CategoryExplorer() {
  const context = useContext(myContext);
  const { catalogues, setFilterType } = context;

  return (
    <section className="py-10 bg-[#FAF7F0] dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl space-y-10">

        {/* Section B: Shop Silk Sarees By Type (4 Dynamic Rotating Tiles) */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[#800020] dark:text-[#E5C158] font-bold text-[11px] uppercase tracking-widest block mb-1">
              Handloom Silk Weaves
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#24211F] dark:text-white">
              Shop Silk Sarees By Type
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SILK_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                setFilterType={setFilterType}
              />
            ))}
          </div>
        </div>

        {/* Section C: Compact All Collections Selector */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[#E9E1D5] dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9E1D5] dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#800020] text-[#E5C158] rounded-xl text-lg">
                <FiGrid />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-[#24211F] dark:text-white">
                  Explore All Saree Collections
                </h3>
                <p className="text-xs text-[#77716A] dark:text-gray-400">
                  Select a collection to browse verified silk weaves and price ranges.
                </p>
              </div>
            </div>

            <Link
              to="/allproducts"
              onClick={() => setFilterType('')}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#800020] dark:text-[#E5C158] hover:underline"
            >
              <span>View All Silk Sarees</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Compact Collection Grid Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {catalogues.map((cat) => (
              <Link
                key={cat.id}
                to="/allproducts"
                onClick={() => setFilterType(cat.name)}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F0] dark:bg-gray-800/80 border border-[#E9E1D5] dark:border-gray-700/60 hover:bg-white dark:hover:bg-gray-800 hover:border-[#800020] hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#800020] text-[#E5C158] font-serif font-extrabold text-sm flex items-center justify-center shadow-sm flex-shrink-0">
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[#24211F] dark:text-white group-hover:text-[#800020] dark:group-hover:text-[#E5C158] transition-colors leading-tight">
                      {cat.name}
                    </h4>
                    <p className="text-[10px] text-[#77716A] dark:text-gray-400 mt-0.5">
                      Range: {cat.indicativePriceRange}
                    </p>
                  </div>
                </div>

                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#800020] dark:group-hover:text-[#E5C158] group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default CategoryExplorer;
