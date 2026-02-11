import { Users, ClipboardCheck, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { employeeAPI, dashboardAPI } from '../services/api';

export default function Dashboard() {
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({
        total_employees: 0,
        present_today: 0,
        absent_today: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch dashboard stats
                const statsResponse = await dashboardAPI.getStats();
                setStats(statsResponse.data);

                // Fetch recent employees for activity feed
                const employeesResponse = await employeeAPI.getAll();
                setEmployees(employeesResponse.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate attendance rate
    const attendanceRate = stats.total_employees > 0
        ? Math.round((stats.present_today / stats.total_employees) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Good Morning, Admin! 👋</h1>
                <p className="text-slate-600 mt-1">Here's what's happening with your organization today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Total Employees */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Employees</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">
                                {isLoading ? '...' : stats.total_employees}
                            </h3>
                            <div className="mt-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Card 2: Attendance Rate */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600">Present Today</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">
                                {isLoading ? '...' : stats.present_today}
                            </h3>
                            <div className="mt-3">
                                <span className="text-xs text-slate-600">
                                    {attendanceRate}% attendance rate
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg ml-4">
                            <ClipboardCheck className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Card 3: Absent Today */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Absent Today</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">
                                {isLoading ? '...' : stats.absent_today}
                            </h3>
                            <div className="mt-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {stats.absent_today > 0 ? 'Monitor' : 'All Present'}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Dashboard Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
                {isLoading ? (
                    <div className="text-center py-8 text-slate-500">Loading recent activity...</div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No activity yet. Add employees to get started!</div>
                ) : (
                    <div className="space-y-3">
                        {employees.slice(0, 3).map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Employee registered</p>
                                        <p className="text-xs text-slate-500">{employee.full_name} - {employee.department}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">Recently added</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
