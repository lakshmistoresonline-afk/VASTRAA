import React from 'react';
import Layout from '../../components/layout/Layout';
import HeroSection from '../../components/heroSection/HeroSection';
import CategoryExplorer from '../../components/categoryExplorer/CategoryExplorer';
import Filter from '../../components/filter/Filter';
import ProductCard from '../../components/productCard/ProductCard';
import Track from '../../components/track/Track';
import Testimonial from '../../components/testimonial/Testimonial';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Layout>
      <HeroSection />

      <CategoryExplorer />

      <Filter />

      <ProductCard limit={8} />

      <div className="flex justify-center -mt-6 mb-12">
        <Link to="/allproducts">
          <button className="bg-[#800020] hover:bg-[#67001a] text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider">
            Explore All Live Saree Catalogues →
          </button>
        </Link>
      </div>

      <Track />

      <Testimonial />
    </Layout>
  );
};

export default Home;
