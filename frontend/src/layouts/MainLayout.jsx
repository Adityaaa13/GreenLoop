import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
