import React, { useState } from 'react';
import { Search, Plus, CreditCard as Edit, Trash2, Mail, Phone, Eye } from 'lucide-react';
import ViewDataModal from '../ViewDataModal';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinDate: string;
}

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 (555) 123-4567', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 (555) 234-5678', status: 'Active', joinDate: '2024-01-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 (555) 345-6789', status: 'Inactive', joinDate: '2024-02-01' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+1 (555) 456-7890', status: 'Active', joinDate: '2024-02-10' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', phone: '+1 (555) 567-8901', status: 'Active', joinDate: '2024-02-15' },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">User</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Contact</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Join Date</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">ID: {user.id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{user.joinDate}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View User Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      <ViewDataModal
        isOpen={viewModalOpen}
        onClose={handleCloseModal}
        data={selectedUser}
        type="user"
        title="User Details"
      />
    </div>
  );
};

export default Users;