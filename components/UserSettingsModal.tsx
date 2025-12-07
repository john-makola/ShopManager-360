
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { X, Camera, Lock, User as UserIcon, Save, Mail, Phone, MapPin } from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'Profile' | 'Security'>('Profile');
  
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    photo: user.photo || '',
    homePhone: user.homePhone || '',
    officePhone: user.officePhone || '',
    residentialAddress: user.residentialAddress || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sync state with props when user changes
  useEffect(() => {
    setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        photo: user.photo || '',
        homePhone: user.homePhone || '',
        officePhone: user.officePhone || '',
        residentialAddress: user.residentialAddress || ''
    });
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'Profile') {
        onUpdate(formData);
        onClose();
    } else {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        if (!passwordData.currentPassword) {
            alert("Please enter current password.");
            return;
        }
        alert("Password updated successfully.");
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
           <h3 className="text-lg font-bold text-slate-800">Account Settings</h3>
           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
             <X size={20} />
           </button>
        </div>

        <div className="flex border-b border-slate-200 px-6">
            <button 
                onClick={() => setActiveTab('Profile')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Profile Details
            </button>
            <button 
                onClick={() => setActiveTab('Security')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Security' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Security
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {activeTab === 'Profile' ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                                {formData.photo ? (
                                    <img src={formData.photo} alt="Profile" className="w-full h-full object-cover"/>
                                ) : (
                                    <UserIcon size={32} className="text-slate-300"/>
                                )}
                            </div>
                            <button type="button" className="absolute bottom-0 right-0 bg-slate-800 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors shadow-sm">
                                <Camera size={12} />
                            </button>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">{user.firstName} {user.lastName}</h4>
                            <p className="text-xs text-slate-500">{user.role} • @{user.username}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                value={formData.firstName}
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                value={formData.lastName}
                                onChange={e => setFormData({...formData, lastName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                            <input 
                                type="email"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                            <input 
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                value={formData.homePhone}
                                onChange={e => setFormData({...formData, homePhone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                            <input 
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                value={formData.residentialAddress}
                                onChange={e => setFormData({...formData, residentialAddress: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800 mb-4 flex items-start gap-2">
                        <Lock size={16} className="shrink-0 mt-0.5"/>
                        <p>For security, ensure your new password is at least 8 characters long and includes a mix of letters and numbers.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                        <input 
                            type="password"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                            value={passwordData.currentPassword}
                            onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                        <input 
                            type="password"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm Password</label>
                        <input 
                            type="password"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                    </div>
                </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-lg transition-colors">
                    Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
                    <Save size={16} /> Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
