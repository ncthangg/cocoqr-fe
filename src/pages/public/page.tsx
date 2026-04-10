import React, { memo } from "react";
import { HeroSection } from "./components/hero-section";
import { FeaturesSection } from "./components/features-section";
import { ContactSection } from "./components/contact-section";
import { Header } from "./components/header";
import FloatingNav from "./components/floating-nav";

const HomePage: React.FC = () => {
    //#region Render
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-bg font-primary selection:bg-primary/10 selection:text-primary">
            {/* Standard Fixed Header Container */}
            <header className="shrink-0 z-50 border-b border-border/50 bg-bg/80 backdrop-blur-md">
                <Header />
            </header>

            {/* Scrollable Main Area mit Snap Points */}
            <main 
                id="home" 
                className="flex-1 w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth focus:outline-none"
            >
                <HeroSection />
                <FeaturesSection />
                <ContactSection />
            </main>

            {/* Global Overlay Navigation */}
            <FloatingNav />
        </div>
    );
    //#endregion
};

export default memo(HomePage);
