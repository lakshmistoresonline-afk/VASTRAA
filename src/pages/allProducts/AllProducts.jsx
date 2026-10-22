import React, { useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Filter from '../../components/filter/Filter';
import ProductCard from '../../components/productCard/ProductCard';

function AllProducts() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="bg-[#4A071B] text-amber-50 py-12 px-4 text-center border-b-4 border-[#C6A15B]">
        <span className="text-[#C6A15B] font-bold text-xs uppercase tracking-widest block mb-1">
          Vastraa • A Co-Brand of Lakshmi Stores
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F7F0E4]">
          Exclusive Silk Saree Collections
        </h1>
        <p className="text-xs text-amber-200/80 mt-2 max-w-xl mx-auto leading-relaxed">
          Explore Kanchipuram Pure Wedding Silks, Pure Fancy Silks, and Soft Silks curated directly from our showroom inventory.
        </p>
      </div>

      <Filter />

      <ProductCard isPaginated={true} itemsPerPage={24} />
    </Layout>
  );
}

export default AllProducts;
