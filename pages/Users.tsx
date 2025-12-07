
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../types';
import { 
  UserCog, Search, Plus, Edit, Trash2, 
  LayoutList, LayoutGrid, Download, Printer, 
  Upload, X, UserCircle, Phone, Mail, MapPin, 
  Shield, Ban, CheckCircle, Briefcase, Users as UsersIcon
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useAppContext();
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
        nextOfKin: {
            name: user.nextOfKin?.name || '',
            relationship: user.nextOfKin?.relationship || '',
            phone: user.nextOfKin?.phone || '',
            address: user.nextOfKin?.address || ''
        }
      });
    } else {
      setEditingUser(null);
      setFormData(initialFormState);
    }
    setActiveFormTab('Personal');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username) return;

    const userData: User = {
      id: editingUser ? editingUser.id : Math.random().toString(36).substr(2, 9),
      ...formData,
      lastLogin: editingUser ? editingUser.lastLogin : undefined
    };

    if (editingUser) {
      updateUser(userData);
    } else {
      addUser(userData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user ${name}?`)) {
      deleteUser(id);
    }
  };

  const handleToggleStatus = (user: User) => {
      const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
      updateUser({ ...user, status: newStatus });
  };

  const handleExport = () => {
      const exportData = users.map(u => ({
          ...u,
          nextOfKinName: u.nextOfKin?.name,
          nextOfKinPhone: u.nextOfKin?.phone
      }));
      exportToCSV(exportData, 'System_Users');
  };

  const handlePrint = () => {
      const content = `
        <h3>System Users List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Contract</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
                <tr>
                    <td>${u.firstName} ${u.lastName}</td>
                    <td>${u.role}</td>
                    <td>${u.email}</td>
                    <td>${u.officePhone || u.homePhone || '-'}</td>
                    <td>${u.contractType}</td>
                    <td>${u.status}</td>
                </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      const html = generatePDFReport({ title: 'Users Report', content });
      openPDFWindow(html);
  };

  const renderBoardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
            <div key={user.id} className={`bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${user.status === 'Disabled' ? 'border-red-200 bg-slate-50' : 'border-slate-200'}`}>
                {user.status === 'Disabled' && (
                    <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                        DISABLED
                    </div>
                )}
                
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border-2 border-white shadow-sm">
                        {user.photo ? (
                            <img src={user.photo} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle size={40} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{user.firstName} {user.lastName}</h3>
                        <p className="text-xs text-slate-500 mb-1">@{user.username}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            user.role === 'Administrator' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            user.role === 'Operator' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-green-50 text-green-700 border-green-100'
                        }`}>
                            {user.role}
                        </span>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 truncate">
                        <Mail size={14} className="text-slate-400"/> {user.email}
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400"/> {user.officePhone || user.homePhone || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-slate-400"/> {user.contractType}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                    <button 
                        onClick={() => handleToggleStatus(user)}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors flex items-center gap-1 ${user.status === 'Active' ? 'text-green-600 hover:bg-green-50' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        {user.status === 'Active' ? <CheckCircle size={12}/> : <Ban size={12}/>}
                        {user.status}
                    </button>
                    <div className="flex gap-1">
                        <button onClick={() => handleOpenModal(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(user.id, user.username)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16}/></button>
                    </div>
                </div>
            </div>
        ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contract</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredUsers.map(user => (
                    <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${user.status === 'Disabled' ? 'bg-slate-50/50' : ''}`}>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
                                {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover"/> : <UserCircle size={20} />}
                             </div>
                             <div>
                                 <div className="font-medium text-slate-800">{user.firstName} {user.lastName}</div>
                                 <div className="text-xs text-slate-500">@{user.username}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            user.role === 'Administrator' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            user.role === 'Operator' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-green-50 text-green-700 border-green-100'
                          }`}>
                             {user.role}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 flex flex-col gap-1">
                             <span className="flex items-center gap-2 text-xs"><Mail size={12}/> {user.email}</span>
                             <span className="flex items-center gap-2 text-xs"><Phone size={12}/> {user.officePhone || user.homePhone || '-'}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-slate-700">{user.contractType}</td>
                       <td className="px-6 py-4">
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className={`text-xs font-bold px-2 py-1 rounded-full border ${
                                user.status === 'Active' 
                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200' 
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-green-100 hover:text-green-700 hover:border-green-200'
                            }`}
                          >
                             {user.status}
                          </button>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleOpenModal(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit size={16} /></button>
                             <button onClick={() => handleDelete(user.id, user.username)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCog className="text-slate-600"/> User Management
          </h1>
          <p className="text-slate-500">Manage staff access, roles, and profiles.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><LayoutList size={18} /></button>
                <button onClick={() => setViewMode('board')} className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid size={18} /></button>
            </div>
            
            <button onClick={handlePrint} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"><Printer size={20} /></button>
            <button onClick={handleExport} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"><Download size={20} /></button>

            <button 
            onClick={() => handleOpenModal()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
            <Plus size={18} />
            Add User
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search users by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
         </div>
      </div>

      {viewMode === 'list' ? renderListView() : renderBoardView()}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                 <h3 className="text-xl font-bold text-slate-800">{editingUser ? 'Edit User Profile' : 'New User Profile'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
              </div>
              
              <div className="flex border-b border-slate-200 px-6 bg-white">
                  {(['Personal', 'Contact', 'Employment', 'NextOfKin'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveFormTab(tab)}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeFormTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      >
                          {tab.replace(/([A-Z])/g, ' $1').trim()}
                      </button>
                  ))}
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                 {/* Personal Info Tab */}
                 {activeFormTab === 'Personal' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="md:col-span-2 flex justify-center mb-4">
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                                {formData.photo ? <img src={formData.photo} alt="Preview" className="w-full h-full rounded-full object-cover"/> : <UserCircle size={48} className="text-slate-300"/>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name *</label>
                            <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Middle Name</label>
                            <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name *</label>
                            <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">National ID *</label>
                            <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} />
                        </div>
                     </div>
                 )}

                 {/* Contact Info Tab */}
                 {activeFormTab === 'Contact' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address *</label>
                            <input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Office Phone</label>
                            <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.officePhone} onChange={e => setFormData({...formData, officePhone: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Home Phone</label>
                            <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.homePhone} onChange={e => setFormData({...formData, homePhone: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Residential Address</label>
                            <textarea rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.residentialAddress} onChange={e => setFormData({...formData, residentialAddress: e.target.value})} />
                        </div>
                     </div>
                 )}

                 {/* Employment Tab */}
                 {activeFormTab === 'Employment' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username *</label>
                            <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role *</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                                <option value="Administrator">Administrator</option>
                                <option value="Operator">Operator</option>
                                <option value="User">User</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contract Type</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value as any})}>
                                <option value="Permanent">Permanent</option>
                                <option value="Contract">Contract</option>
                                <option value="Intern">Intern</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                <option value="Active">Active</option>
                                <option value="Disabled">Disabled</option>
                            </select>
                        </div>
                     </div>
                 )}

                 {/* Next Of Kin Tab */}
                 {activeFormTab === 'NextOfKin' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Emergency Contact Details</h4>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.nextOfKin.name} onChange={e => setFormData({...formData, nextOfKin: {...formData.nextOfKin, name: e.target.value}})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Relationship</label>
                            <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.nextOfKin.relationship} onChange={e => setFormData({...formData, nextOfKin: {...formData.nextOfKin, relationship: e.target.value}})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                            <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.nextOfKin.phone} onChange={e => setFormData({...formData, nextOfKin: {...formData.nextOfKin, phone: e.target.value}})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                            <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.nextOfKin.address} onChange={e => setFormData({...formData, nextOfKin: {...formData.nextOfKin, address: e.target.value}})} />
                        </div>
                     </div>
                 )}

                 <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm"
                    >
                      {editingUser ? 'Update Profile' : 'Create User'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
