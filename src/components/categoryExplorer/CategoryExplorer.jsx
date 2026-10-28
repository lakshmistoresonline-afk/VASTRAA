import React, { useContext } from 'react';
import myContext from '../../context/data/myContext';
import { CATALOGUES } from '../../data/catalogues';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiAward } from 'react-icons/fi';
import SareeImageThumbnail from '../SareeImageThumbnail';
import extractedData from '../../data/extractedSarees.json';

function CategoryExplorer() {
  const context = useContext(myContext);
  const { setFilterType, product } = context;
  const navigate = useNavigate();

  const featuredCatalogues = CATALOGUES.slice(0, 6);

  return (
    <section className="py-12 bg-[#FAF7F0] dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl space-y-12">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-[#E9E1D5] dark:border-gray-800">
          <div className="space-y-1">
            <span className="text-[#800020] dark:text-[#E5C158] font-bold text-xs uppercase tracking-widest block">
              Handloom Weaves & Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#24211F] dark:text-white">
              Explore by Category & Online Collections
            </h2>
          </div>
          <Link
            to="/allproducts"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#800020] dark:text-[#E5C158] hover:underline"
          >
            <span>View All {product ? product.length : 3252} Sarees</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid with Rotating Visual Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left: Featured Showcase Card */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] group border-2 border-[#C6A15B]/40">
            <SareeImageThumbnail
              id="gphoto_A_signature_featured"
              src={extractedData.A?.[0]?.imageUrl}
              alt="Bridal Silk Saree Showcase"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 text-white space-y-3">
              <span className="bg-[#800020] text-[#C6A15B] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest self-start border border-[#C6A15B]/40">
                Signature Collection
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#F7F0E4]">
                Kanchipuram Pure Wedding Silks
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Authentic bridal handloom masterpieces woven with pure zari threads and rich traditional pallus.
              </p>
              <div className="pt-2">
                <Link
                  to="/allproducts"
                  onClick={() => setFilterType("Kanchipuram Pure Wedding Silk Sarees")}
                  className="inline-flex items-center gap-2 bg-[#C6A15B] hover:bg-[#b0904d] text-gray-950 font-extrabold px-6 py-3 rounded-xl text-xs shadow-lg transition-all"
                >
                  <span>Explore Bridal Weaves</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Category List */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredCatalogues.map((cat) => (
              <Link
                key={cat.id}
                to="/allproducts"
                onClick={() => setFilterType(cat.name)}
                className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900 border border-[#E9E1D5] dark:border-gray-800 hover:border-[#800020] hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#800020] to-[#4A071B] text-[#E5C158] font-serif font-extrabold text-sm flex items-center justify-center shadow-md flex-shrink-0 border border-[#C6A15B]/30">
                    {cat.code}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[#24211F] dark:text-white group-hover:text-[#800020] dark:group-hover:text-[#E5C158] transition-colors leading-snug">
                      {cat.name}
                    </h4>
                  </div>
                </div>

                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#800020] dark:group-hover:text-[#E5C158] group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>

        </div>

        {/* Homepage Referral & Welcome Offers Banner */}
        <div className="bg-gradient-to-r from-[#4A071B] via-[#650A25] to-[#800020] text-amber-50 p-6 sm:p-8 rounded-3xl shadow-xl border-b-4 border-[#C6A15B] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-[#C6A15B] text-gray-950 font-black px-3.5 py-1 rounded-full text-[10px] uppercase tracking-wider">
              Exclusive Member Loyalty Offers
            </span>
            <h3 className="text-2xl font-serif font-extrabold text-white">
              🎁 Refer Friends & Earn 1% Saree Credits + 5% Friend Welcome Pass
            </h3>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Invite your friends to shop for handloom sarees! Your friend gets an instant <strong className="text-white">5% OFF Welcome Pass</strong> on their 1st saree order, and you earn <strong className="text-white">1% Order Cashback</strong> credited directly to your Vastraa Saree Wallet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
            <Link
              to="/account"
              className="bg-[#C6A15B] hover:bg-white text-gray-950 font-extrabold px-6 py-3.5 rounded-xl text-xs shadow-lg transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Get Your Referral Link 💬</span>
            </Link>
          </div>
        </div>

        {/* Store Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-[#E9E1D5] dark:border-gray-800 text-xs">
          <div className="flex items-center gap-3.5 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] dark:bg-gray-800 text-[#800020] dark:text-[#E5C158] flex items-center justify-center text-lg flex-shrink-0">
              <FiShield />
            </div>
            <div>
              <h5 className="font-bold text-[#24211F] dark:text-white">100% Pure Handloom</h5>
              <p className="text-[11px] text-gray-500">Silk Mark Certified Authentic Weaves</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] dark:bg-gray-800 text-[#800020] dark:text-[#E5C158] flex items-center justify-center text-lg flex-shrink-0">
              <FiTruck />
            </div>
            <div>
              <h5 className="font-bold text-[#24211F] dark:text-white">Pan India Shipping</h5>
              <p className="text-[11px] text-gray-500">Insured express doorstep delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] dark:bg-gray-800 text-[#800020] dark:text-[#E5C158] flex items-center justify-center text-lg flex-shrink-0">
              <FiAward />
            </div>
            <div>
              <h5 className="font-bold text-[#24211F] dark:text-white">Online Collections Legacy</h5>
              <p className="text-[11px] text-gray-500">Vastraa Online Collections</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] dark:bg-gray-800 text-[#800020] dark:text-[#E5C158] flex items-center justify-center text-lg flex-shrink-0">
              <FiRefreshCw />
            </div>
            <div>
              <h5 className="font-bold text-[#24211F] dark:text-white">Assisted Quotation</h5>
              <p className="text-[11px] text-gray-500">Verified availability & best pricing</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default CategoryExplorer;
