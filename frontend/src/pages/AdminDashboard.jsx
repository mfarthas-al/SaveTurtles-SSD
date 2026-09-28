import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const buttons = [
        { label: "Events", path: "/events" },
        { label: "Products", path: "/products" },
        { label: "Donations", path: "/donations" },
        { label: "Membership", path: "/membership/view" },
        { label: "Refunds", path: "/refunds" },
        { label: "Returns", path: "/returns" },
        { label: "Tickets", path: "/tickets" },
        { label: "FAQ", path: "/faqdashboard" },
        { label: "Rescue", path: "/analytics" },
        { label: "Admins", path: "/admin/admins" },
    ];

    const handleButtonClick = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-blue-600 text-white shadow-md">
                <div className="container mx-auto flex justify-between items-center py-4 px-6">
                    <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                    >
                        Logout
                    </button>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {buttons.map((button, index) => (
                        <div
                            key={index}
                            onClick={() => handleButtonClick(button.path)}
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col items-center justify-center text-center hover:bg-sky-500 hover:text-white"
                        >
                            <span className="text-xl font-semibold text-gray-700 hover:text-white">
                                {button.label}
                            </span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
