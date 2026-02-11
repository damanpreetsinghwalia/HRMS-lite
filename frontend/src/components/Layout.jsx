import { NavLink, Outlet } from 'react-router-dom';
import { Bell, User } from 'lucide-react';

export default function Layout() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Logo */}
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-blue-600">HRMS Lite</h1>
                        </div>

                        {/* Center: Navigation Tabs */}
                        <div className="flex items-center space-x-8">
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) =>
                                    `pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${isActive
                                        ? 'text-blue-600 border-blue-600'
                                        : 'text-slate-600 border-transparent hover:text-blue-600 hover:border-blue-300'
                                    }`
                                }
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/employees"
                                className={({ isActive }) =>
                                    `pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${isActive
                                        ? 'text-blue-600 border-blue-600'
                                        : 'text-slate-600 border-transparent hover:text-blue-600 hover:border-blue-300'
                                    }`
                                }
                            >
                                Employees
                            </NavLink>
                            <NavLink
                                to="/attendance"
                                className={({ isActive }) =>
                                    `pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${isActive
                                        ? 'text-blue-600 border-blue-600'
                                        : 'text-slate-600 border-transparent hover:text-blue-600 hover:border-blue-300'
                                    }`
                                }
                            >
                                Attendance
                            </NavLink>
                        </div>

                        {/* Right: Notification + Avatar */}
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <Bell className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-slate-700">Admin User</span>
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                    AU
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pt-16">
                <div className="max-w-7xl mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
