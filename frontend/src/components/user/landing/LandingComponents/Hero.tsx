import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../../store';

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth.user);

  const handleGetQuote = () => {
    if(!user) {
      navigate('/login');
      return;
    }
    navigate('/book');
  };
  return (
    <div>
      <section className="container mx-auto py-16 px-4 md:px-8 relative">
  <div className="flex flex-col md:flex-row items-center">
    <div className="md:w-1/2 mb-8 md:mb-0">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Quick & Reliable <span className="text-red-400">Logistics</span> Solution.
      </h1>
      <p className="text-gray-600 mb-8">
        ShipUp delivers an unparalleled customer service through dedicated customer teams, engaged people working in an agile culture, and a global footprint for all your shipping and delivery needs.
      </p>
      <button className="bg-indigo-900 text-white py-3 px-6 rounded-md hover:bg-indigo-800"
        onClick={handleGetQuote}>
        Get Quote
      </button>
    </div>
    
    <div className="md:w-1/2 flex justify-center">
      <img src="/woman.png" alt="Delivery illustration" className="max-w-full h-auto" />
    </div>
  </div>
</section>
    </div>
  )
}

export default Hero
