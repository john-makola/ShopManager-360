import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../types';
import { 
  UserCog, Search, Plus, Edit, Trash2, 
  LayoutList, LayoutGrid, Download, Printer, 
  Upload, X, UserCircle, Phone, Mail, MapPin, 
  Shield, Ban, CheckCircle, Briefcase, Users as UsersIcon,
  User as UserIcon
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentOrganization } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Tab state for the modal form
  const [activeFormTab, setActiveFormTab] = useState<'Personal' | 'Contact' | 'Employment' | 'NextOfKin'>('Personal');

  // Initial Form State
  const initialFormState = {
    firstName: '',
    middleName: '',
    lastName: '',
    photo: '',
    email: '',
    username: '',
    nationalId: '',
    homePhone: '',
    officePhone: '',
    role: 'User' as User['role'],
    contractType: 'Permanent' as User['contractType'],
    residentialAddress: '',
    status: 'Active' as User['status'],
    nextOfKin: {
        name: '',
        relationship: '',
        phone: '',
        address: ''
    }
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        middleName: user.middleName || '',
        lastName: user.lastName,
        photo: user.photo || '',
        email: user.email,
        username: user.username,
        nationalId: user.nationalId,
        homePhone: user.homePhone || '',
        officePhone: user.officePhone || '',
        role: user.role,
        contractType: user.contractType,
        residentialAddress: user.residentialAddress || '',
        status: user.status,
        nextOfKin: user.nextOfKin || initialFormState.nextOfKin
      });
    } else {
      setEditingUser(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email) return;

    const userData: User = {
      id: editingUser ? editingUser.id : Math.random().toString(36).substr(2, 9),
      organizationId: editingUser?.organizationId || '',
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      nationalId: formData.nationalId,
      homePhone: formData.homePhone,
      officePhone: formData.officePhone,
      contractType: formData.contractType,
      residentialAddress: formData.residentialAddress,
      nextOfKin: formData.nextOfKin,
      password: editingUser ? editingUser.password : 'password123', // Default password for new users
      photo: formData.photo
    };

    if (editingUser) {
        updateUser(userData);
    } else {
        addUser(userData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
          deleteUser(id);
      }
  };

  const handleExport = () => exportToCSV(users, 'Users_List');
  
  const handlePrint = () => {
    const content = `
        <h3>Staff List</h3>
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
          <tbody>
            ${users.map(u => `<tr><td>${u.firstName} ${u.lastName}</td><td>${u.role}</td><td>${u.email}</td><td>${u.homePhone}</td><td>${u.status}</td></tr>`).join('')}
          </tbody>
        </table>
    `;
    const html = generatePDFReport({ title: 'Users Directory', content, organization: currentOrganization });
    openPDFWindow(html);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
           <p className="text-slate-500">Manage system access and staff profiles.</p>
         </div>
         <div className="flex flex-wrap items-center gap-2">
            <button onClick={handlePrint} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"><Printer size={20} /></button>
            <button onClick={handleExport} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"><Download size={20} /></button>
            <button 
                onClick={() => handleOpenModal()}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
                <Plus size={18} /> Add User
            </button>
         </div>
       </div>

       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
         </div>
       </div>

       <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                   <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                               {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover"/> : <UserIcon size={16} />}
                            </div>
                            <div>
                                <div className="font-medium text-slate-800">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-slate-500">@{user.username}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.role}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                            {user.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenModal(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(user.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {isModalOpen && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="text-xl font-bold text-slate-800">{editingUser ? 'Edit User' : 'Add User'}</h3>
                  <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-red-500" size={20} /></button>
               </div>
               
               <div className="p-6 overflow-y-auto">
                  <form onSubmit={handleSave} className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name *</label><input required className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name *</label><input required className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username *</label><input required className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email *</label><input required type="email" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                                <option value="User">User</option>
                                <option value="Operator">Operator</option>
                                <option value="Administrator">Administrator</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                <option value="Active">Active</option>
                                <option value="Disabled">Disabled</option>
                            </select>
                        </div>
                     </div>
                     
                     <div className="border-t border-slate-100 pt-4">
                        <h4 className="text-sm font-bold text-slate-800 mb-3">Additional Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">National ID</label><input className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label><input className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.homePhone} onChange={e => setFormData({...formData, homePhone: e.target.value})} /></div>
                        </div>
                     </div>

                     <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save User</button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default UsersPage;