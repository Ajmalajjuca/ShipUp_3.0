import Global_map from "../../components/user/landing/Global_map";
import Calculator from "../../components/user/landing/LandingComponents/Calculator";
import Hero from "../../components/user/landing/LandingComponents/Hero";
import Operation from "../../components/user/landing/LandingComponents/Operation";
import Services from "../../components/user/landing/LandingComponents/Services";
import HomeLayout from "../../components/user/layout/HomeLayout";

const Homepage = () => {


  return (
    <HomeLayout>

    <div className="flex flex-col min-h-screen bg-gray-50">


      {/* Hero Section */}
      <Hero />

      {/* Calculator Section */}
      <Calculator />

      {/* Services Section */}
      <Services />

      {/* Operation Mode Section */}
      <Operation />

      {/* Global Map Section */}
      <Global_map />


    </div>
    </HomeLayout>
  );
};

export default Homepage;