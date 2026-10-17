import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import myContext from '../../context/data/myContext';
import { FiArrowRight } from 'react-icons/fi';

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
  const { catalogues, setFilterType, product } = context;

  return (
    <section className="py-12 bg-[#FAF7F0] dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl space-y-12">

        {/* Top 4 Silk Saree Category Banners */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[#800020] dark:text-[#E5C158] font-bold text-xs uppercase tracking-widest block mb-1">
              Handloom Silk Weaves
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#24211F] dark:text-white">
              Shop Silk Sarees By Type
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SILK_CATEGORY_BANNERS.map((banner) => (
              <Link
                key={banner.id}
                to="/allproducts"
                onClick={() => setFilterType(banner.filterValue)}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-md border border-[#E9E1D5] dark:border-gray-800 bg-white dark:bg-gray-900 flex items-end p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                <div className="relative z-10 text-white space-y-1 w-full">
                  <h3 className="font-serif font-bold text-lg text-amber-50 group-hover:text-[#E5C158] transition-colors">
                    {banner.title}
                  </h3>
                  <p className="text-[11px] text-amber-100/80 font-normal line-clamp-1">
                    {banner.subtitle}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-[#E5C158]">
                    <span>Explore Silks</span>
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 9 Silk Saree Catalogue Showcases */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-[#800020] dark:text-[#E5C158] font-bold text-xs uppercase tracking-widest block mb-1">
              Live Showroom Albums
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#24211F] dark:text-white">
              All 9 Live Silk Saree Catalogues (A through I)
            </h2>
            <p className="text-xs text-[#77716A] dark:text-gray-400 mt-1">
              Synced live from Google Photos shared albums. Over 3,250 verified silk sarees in stock.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogues.map((cat) => {
              const count = product ? product.filter(p => p.catalogueCode === cat.code).length : 0;

              return (
                <div
                  key={cat.id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-[#E9E1D5] dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-[#C5A46D] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={cat.featuredImage}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    <div className="absolute top-3 left-3 bg-[#800020] text-[#E5C158] border border-[#C5A46D]/60 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
                      Cat {cat.code}
                    </div>

                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                      {count} Sarees Live
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="bg-black/70 backdrop-blur-md border border-amber-300/30 text-amber-200 text-[11px] px-2.5 py-1 rounded-lg font-bold">
                        Range: {cat.indicativePriceRange}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-serif font-bold text-[#24211F] dark:text-white mb-1 group-hover:text-[#800020] dark:group-hover:text-[#E5C158] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#77716A] dark:text-gray-400 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-gray-400">
                        Verified Silk Weave
                      </span>
                      <Link
                        to="/allproducts"
                        onClick={() => setFilterType(cat.name)}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#800020] dark:text-[#E5C158] group-hover:translate-x-1 transition-transform"
                      >
                        <span>View Silk Sarees</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

export default CategoryExplorer;
