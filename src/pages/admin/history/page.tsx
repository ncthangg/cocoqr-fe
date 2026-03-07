import React from "react";

const HistoryPage: React.FC = () => {
    return (
        <div>
            <h1>HistoryPage</h1>
            <p>Welcome to the administration panel. Here you can manage the application settings and users.</p>
            <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-6 border border-border rounded-lg bg-surface">
                    <h3>Total Users</h3>
                    <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="p-6 border border-border rounded-lg bg-surface">
                    <h3>Active QRs</h3>
                    <p className="text-2xl font-bold">567</p>
                </div>
                <div className="p-6 border border-border rounded-lg bg-surface">
                    <h3>Revenue</h3>
                    <p className="text-2xl font-bold">$12,345</p>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
