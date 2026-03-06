import React from "react";
import { HeroSection } from "./ui/hero-section";
import { FeaturesSection } from "./ui/features-section";
import { ContactSection } from "./ui/contact-section";
import { Header } from "./ui/header";
import { Footer } from "./ui/footer";

const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
            <div className="shrink-0 z-50 shadow-sm border-b border-border">
                <Header />
            </div>
            <main className="flex-1 w-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
                <HeroSection />
                <FeaturesSection />
                <ContactSection />
            </main>
            <div className="shrink-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-border relative">
                <div className="absolute top-0 w-full h-full bg-card -z-10" />
                <Footer />
            </div>
        </div>
    );
};

export default HomePage;
