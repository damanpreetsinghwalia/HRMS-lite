import { Search, Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';

export default function Attendance() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState(new Map()); // Map of employee_id -> status
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Generate last 7 days dates
    const getLast7Days = () => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date);
        }
        return dates;
    };

    const last7Days = getLast7Days();

    // Fetch employees and attendance from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await employeeAPI.getAll();
                setEmployees(response.data);

                // Try to fetch existing attendance for selected date
                try {
                    const attendanceResponse = await attendanceAPI.getByDate(selectedDate);
                    const attendanceMap = new Map();

                    // Create a map from the attendance records
                    attendanceResponse.data.forEach(record => {
                        attendanceMap.set(record.employee_id, record.status);
                    });

                    // Initialize all employees (default to Present if no record)
                    response.data.forEach(emp => {
                        if (!attendanceMap.has(emp.employee_id)) {
                            attendanceMap.set(emp.employee_id, 'Present');
                        }
                    });

                    setAttendanceData(attendanceMap);
                } catch (attendanceError) {
                    // If no attendance data for this date, initialize all as Present
                    const initialAttendance = new Map();
                    response.data.forEach(emp => {
                        initialAttendance.set(emp.employee_id, 'Present');
                    });
                    setAttendanceData(initialAttendance);
                }
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedDate]); // Refetch when date changes

    // Get initials from name
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Filter employees based on search and status filter
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const status = attendanceData.get(emp.employee_id) || 'Present';
        const matchesFilter = filter === 'All' || status === filter;
        return matchesSearch && matchesFilter;
    });

    // Calculate stats
    const stats = {
        total: employees.length,
        present: Array.from(attendanceData.values()).filter(s => s === 'Present').length,
        absent: Array.from(attendanceData.values()).filter(s => s === 'Absent').length,
        late: 0, // Not tracked in this version
    };

    // Toggle attendance status
    const toggleStatus = async (employeeId, newStatus) => {
        // Update local state immediately for better UX
        setAttendanceData(prev => {
            const updated = new Map(prev);
            updated.set(employeeId, newStatus);
            return updated;
        });

        // Send to backend with selected date
        try {
            await attendanceAPI.create({
                employee_id: employeeId,
                date: selectedDate,
                status: newStatus,
            });
        } catch (error) {
            console.error('Failed to mark attendance:', error);
            // If it's a duplicate error (400), it's expected - attendance already marked
            if (error.response?.status !== 400) {
                alert('Failed to save attendance. Please try again.');
            }
        }
    };

    // Mark all present
    const markAllPresent = async () => {
        const updated = new Map();
        employees.forEach(emp => {
            updated.set(emp.employee_id, 'Present');
        });
        setAttendanceData(updated);

        // Send all to backend
        for (const emp of employees) {
            try {
                await attendanceAPI.create({
                    employee_id: emp.employee_id,
                    date: selectedDate,
                    status: 'Present',
                });
            } catch (error) {
                // Ignore duplicate errors
                if (error.response?.status !== 400) {
                    console.error(`Failed to mark ${emp.employee_id} as present:`, error);
                }
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Daily Attendance</h1>
                    <p className="text-slate-600 mt-1">Track and manage employee attendance</p>
                </div>
                {/* Date Picker */}
                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Calendar className="h-5 w-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">
                            {new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </button>

                    {/* Dropdown for last 7 days */}
                    {showDatePicker && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                            <div className="p-2">
                                <p className="text-xs font-semibold text-slate-600 uppercase px-3 py-2">Last 7 Days</p>
                                {last7Days.map((date) => {
                                    const dateStr = date.toISOString().split('T')[0];
                                    const isSelected = dateStr === selectedDate;
                                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => {
                                                setSelectedDate(dateStr);
                                                setShowDatePicker(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${isSelected
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">
                                                    {date.toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                {isToday && (
                                                    <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-blue-600'
                                                        }`}>
                                                        Today
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-600">Total</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-600">Present</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.present}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-600">Absent</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.absent}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-600">Late</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.late}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or emp-id"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setFilter('All')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'All'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('Present')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'Present'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                Present
                            </button>
                            <button
                                onClick={() => setFilter('Absent')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'Absent'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                Absent
                            </button>
                        </div>
                    </div>

                    {/* Mark All Present Button */}
                    <button
                        onClick={markAllPresent}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                        Mark All Present
                    </button>
                </div>
            </div>

            {/* Attendance List/Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Attendance Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                        Loading employees...
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                        {searchTerm || filter !== 'All'
                                            ? 'No employees found matching your criteria.'
                                            : 'No employees yet. Add employees first!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => {
                                    const status = attendanceData.get(employee.employee_id) || 'Present';
                                    return (
                                        <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {getInitials(employee.full_name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{employee.full_name}</p>
                                                        <p className="text-sm text-slate-500">{employee.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {employee.department}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleStatus(employee.employee_id, 'Present')}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === 'Present'
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(employee.employee_id, 'Absent')}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === 'Absent'
                                                            ? 'bg-red-600 text-white'
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
