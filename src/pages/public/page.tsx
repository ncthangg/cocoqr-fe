import React from "react";
import { HeroSection } from "./components/hero-section";
import { FeaturesSection } from "./components/features-section";
import { ContactSection } from "./components/contact-section";
import { Header } from "./components/header";
import { Footer } from "./components/footer";

const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
            <div className="shrink-0 z-50">
                <Header />
            </div>
            <main className="flex-1 w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth">
                <HeroSection />
                <FeaturesSection />
                <ContactSection />
                <div className="w-full snap-start border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative">
                    <div className="absolute top-0 w-full h-full bg-card -z-10" />
                    <Footer />
                </div>
            </main>
        </div>
    );
};

export default HomePage;
