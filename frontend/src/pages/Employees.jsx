import { Search, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { employeeAPI } from '../services/api';

export default function Employees() {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch employees from API
    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await employeeAPI.getAll();
            setEmployees(response.data);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            setError('Failed to load employees. Please check if the backend server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    // Load employees on component mount
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Handle adding new employee
    const handleAddEmployee = async (employeeData) => {
        try {
            await employeeAPI.create(employeeData);
            await fetchEmployees(); // Refresh the list
        } catch (error) {
            throw error; // Let modal handle the error display
        }
    };

    // Handle deleting employee
    const handleDeleteEmployee = async (employeeId) => {
        if (!confirm(`Are you sure you want to delete employee ${employeeId}?`)) {
            return;
        }

        try {
            await employeeAPI.delete(employeeId);
            await fetchEmployees(); // Refresh the list
        } catch (err) {
            console.error('Failed to delete employee:', err);
            alert('Failed to delete employee. Please try again.');
        }
    };

    // Get initials from name
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Filter employees based on search term
    const filteredEmployees = employees.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Employee Directory</h1>
                <p className="text-slate-600 mt-1">Manage your organization's talent</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
                {/* Search Bar */}
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

                {/* Add Employee Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-red-900">Error Loading Employees</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <button
                            onClick={fetchEmployees}
                            className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        Loading employees...
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        {searchTerm ? 'No employees found matching your search.' : 'No employees yet. Add your first employee!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-slate-900">#{employee.employee_id}</span>
                                        </td>
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
                                                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit employee"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(employee.employee_id)}
                                                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete employee"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Employee Modal */}
            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddEmployee}
            />
        </div>
    );
}
