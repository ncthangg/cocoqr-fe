import React from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "../pages/public/components/footer";
import { Header } from "../pages/public/components/header";

const PublicLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-bg">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
