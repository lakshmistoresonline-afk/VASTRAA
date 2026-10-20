import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import myContext from '../../context/data/myContext';
import { FiArrowRight, FiGrid } from 'react-icons/fi';

const SILK_CATEGORY_BANNERS = [
  {
    id: 'wedding-silk-sarees',
    title: 'Pure Wedding Silks',
    subtitle: 'Exquisite bridal handloom Kanchipuram weaves',
    image: '/images/categories/silk-sarees.jpg',
    filterValue: 'Kanchipuram Pure Wedding Silk Sarees'
  },
  {
    id: 'fancy-silk-sarees',
    title: 'Pure Fancy Silks',
    subtitle: 'Vibrant contemporary handwoven silk sarees',
    image: '/images/categories/festive-wear.jpg',
    filterValue: 'Kanchipuram Pure Fancy Silk Sarees'
  },
  {
    id: 'soft-silk-sarees',
    title: 'Pure Soft Silks',
    subtitle: 'Lightweight & comfortable pure Kanchipuram silk',
    image: '/images/categories/kerala-sarees.jpg',
    filterValue: 'Kanchipuram Pure Soft Silk Sarees'
  },
  {
    id: 'art-silk-sarees',
    title: 'Art & Semi Silks',
    subtitle: 'Affordable luxury for everyday celebrations',
    image: '/images/categories/cotton-sarees.jpg',
    filterValue: 'Semi Silk Sarees'
  }
];

function CategoryExplorer() {
  const context = useContext(myContext);
  const { catalogues, setFilterType } = context;

  return (
    <section className="py-10 bg-[#FAF7F0] dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl space-y-10">

        {/* Section B: Shop Silk Sarees By Type (4 Compact Category Tiles) */}
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
            {SILK_CATEGORY_BANNERS.map((banner) => (
              <Link
                key={banner.id}
                to="/allproducts"
                onClick={() => setFilterType(banner.filterValue)}
                className="group relative h-40 rounded-2xl overflow-hidden shadow-sm border border-[#E9E1D5] dark:border-gray-800 bg-white dark:bg-gray-900 flex items-end p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                <div className="relative z-10 text-white space-y-1 w-full">
                  <h3 className="font-serif font-bold text-base text-amber-50 group-hover:text-[#E5C158] transition-colors">
                    {banner.title}
                  </h3>
                  <p className="text-[10px] text-amber-100/80 font-normal line-clamp-1">
                    {banner.subtitle}
                  </p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-[#E5C158]">
                    <span>Explore Silks</span>
                    <FiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section C: Compact All 9 Catalogues Selector (Catalogues A through I) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[#E9E1D5] dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9E1D5] dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#800020] text-[#E5C158] rounded-xl text-lg">
                <FiGrid />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-[#24211F] dark:text-white">
                  Explore All Nine Silk Collections (A through I)
                </h3>
                <p className="text-xs text-[#77716A] dark:text-gray-400">
                  Select a catalogue to browse verified silk weaves and price ranges.
                </p>
              </div>
            </div>

            <Link
              to="/allproducts"
              onClick={() => setFilterType('')}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#800020] dark:text-[#E5C158] hover:underline"
            >
              <span>View All 3,252 Sarees</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Compact 9-Catalogue Grid Chips */}
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
                    {cat.code}
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
