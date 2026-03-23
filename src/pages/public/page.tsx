import React from "react";
import { HeroSection } from "./components/hero-section";
import { FeaturesSection } from "./components/features-section";
import { ContactSection } from "./components/contact-section";
import { Header } from "./components/header";
import { Footer } from "./components/footer";

const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <div className="shrink-0 z-50">
                <Header />
            </div>
            <main className="flex-1 w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth">
                <HeroSection />
                <FeaturesSection />
                <ContactSection />
                <div className="w-full snap-start border-t border-border shadow-sm relative">
                    <Footer />
                </div>
            </main>
        </div>
    );
};

export default HomePage;
