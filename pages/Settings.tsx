
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { 
  User, Lock, User as UserIcon, Mail, Phone, MapPin, 
  Camera, Save, Shield, Bell, Smartphone, Monitor, History,
  LogOut, CheckCircle, AlertCircle, Building, Palette
} from 'lucide-react';
import { User as UserType } from '../types';

const Settings: React.FC = () => {
  const { currentUser, updateUser, logout, currentOrganization, updateOrganization } = useAppContext();
  const { currentTheme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'Profile' | 'Security' | 'Notifications' | 'Organization' | 'Appearance'>('Profile');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Local state for profile form
  const [profileData, setProfileData] = useState<Partial<UserType>>({});
  
  // Local state for org form
  const [orgData, setOrgData] = useState({
      name: '',
      type: '',
      currency: '',
      email: '',
      phone: '',
      address: '',
      taxId: ''
  });

  // Local state for password change
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Local state for notifications (Mock)
  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailLowStock: true,
    emailPromos: false,
    smsUrgent: true,
    browserPush: false
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        username: currentUser.username,
        photo: currentUser.photo,
        homePhone: currentUser.homePhone || '',
        officePhone: currentUser.officePhone || '',
        residentialAddress: currentUser.residentialAddress || '',
      });
    }
    if (currentOrganization) {
        setOrgData({
            name: currentOrganization.name,
            type: currentOrganization.type,
            currency: currentOrganization.currency,
            email: currentOrganization.email || '',
            phone: currentOrganization.phone || '',
            address: currentOrganization.address || '',
            taxId: currentOrganization.taxId || ''
        });
    }
  }, [currentUser, currentOrganization]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');

    await new Promise(resolve => setTimeout(resolve, 800));

    if (currentUser && profileData) {
      updateUser({
        ...currentUser,
        ...profileData
      } as UserType);
      setSuccessMsg('Profile updated successfully.');
    }
    setIsLoading(false);
  };

  const handleOrgUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setSuccessMsg('');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (currentOrganization) {
          updateOrganization({
              ...currentOrganization,
              ...orgData
          } as any); // Cast to any to avoid type complaints with optional fields in form
          setSuccessMsg('Organization settings updated successfully.');
      }
      setIsLoading(false);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        alert("New passwords do not match.");
        return;
    }
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg('Password changed successfully.');
        setPasswords({ current: '', new: '', confirm: '' });
    }, 1000);
  };

  const handleSaveTheme = () => {
      setSuccessMsg('Appearance settings saved successfully.');
      // In a real app, you might persist this to the User or Organization preference in the DB here.
  };

  if (!currentUser) return <div className="p-10 text-center">Please log in to view settings.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500">Manage your profile, security preferences, and notifications.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
         <button
            onClick={() => { setActiveTab('Profile'); setSuccessMsg(''); }}
            className={`pb-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
            <UserIcon size={18} /> My Profile
         </button>
         <button
            onClick={() => { setActiveTab('Appearance'); setSuccessMsg(''); }}
            className={`pb-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Appearance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
            <Palette size={18} /> Appearance
         </button>
         {currentUser.role === 'Administrator' && (
             <button
                onClick={() => { setActiveTab('Organization'); setSuccessMsg(''); }}
                className={`pb-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Organization' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
                <Building size={18} /> Organization
             </button>
         )}
         <button
            onClick={() => { setActiveTab('Security'); setSuccessMsg(''); }}
            className={`pb-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Security' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
            <Shield size={18} /> Security
         </button>
         <button
            onClick={() => { setActiveTab('Notifications'); setSuccessMsg(''); }}
            className={`pb-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Notifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
            <Bell size={18} /> Notifications
         </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Main Content */}
        <div className="lg:col-span-2 space-y-6">
            
            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 border border-green-100 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={20} /> {successMsg}
                </div>
            )}

            {activeTab === 'Profile' && (
                <form onSubmit={handleProfileUpdate} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-800">Personal Information</h3>
                            <p className="text-xs text-slate-500">Update your photo and personal details.</p>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Photo Section */}
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                                    {profileData.photo ? (
                                        <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover"/>
                                    ) : (
                                        <UserIcon size={40} className="text-slate-300"/>
                                    )}
                                </div>
                                <button type="button" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm ring-2 ring-white">
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">{currentUser.firstName} {currentUser.lastName}</h4>
                                <p className="text-sm text-slate-500">{currentUser.role} • {currentUser.contractType}</p>
                                <div className="flex gap-2 mt-2">
                                    <button type="button" className="text-xs text-blue-600 font-medium hover:underline">Remove Photo</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
                                    value={profileData.firstName || ''}
                                    onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
                                    value={profileData.lastName || ''}
                                    onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input 
                                        type="email"
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
                                        value={profileData.email || ''}
                                        onChange={e => setProfileData({...profileData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                                <input 
                                    disabled
                                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm"
                                    value={profileData.username || ''}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input 
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
                                        value={profileData.homePhone || ''}
                                        onChange={e => setProfileData({...profileData, homePhone: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Residential Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <textarea 
                                        rows={3}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none transition-all resize-none"
                                        value={profileData.residentialAddress || ''}
                                        onChange={e => setProfileData({...profileData, residentialAddress: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'Appearance' && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-800">Visual Theme</h3>
                            <p className="text-xs text-slate-500">Select a color theme for the organization dashboard.</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setTheme(theme.id)}
                                    className={`relative p-3 rounded-xl border-2 transition-all text-left flex flex-col gap-3 group ${currentTheme.id === theme.id ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                                >
                                    <div 
                                        className="w-full h-16 rounded-lg shadow-sm flex items-end justify-end p-2 transition-transform group-hover:scale-[1.02]" 
                                        style={{ backgroundColor: `hsl(${theme.primaryHue}, ${theme.primarySat}, 50%)` }}
                                    >
                                        {currentTheme.id === theme.id && (
                                            <div className="bg-white text-blue-600 p-1 rounded-full shadow-md">
                                                <CheckCircle size={14} fill="currentColor" className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-sm font-bold ${currentTheme.id === theme.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                        {theme.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button 
                            onClick={handleSaveTheme}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <Save size={16} /> Save Preference
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'Organization' && currentOrganization && (
                <form onSubmit={handleOrgUpdate} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Organization Profile</h3>
                        <p className="text-xs text-slate-500">Manage shop details, currency, and branding.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shop Name</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    value={orgData.name}
                                    onChange={e => setOrgData({...orgData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Type</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    value={orgData.type}
                                    onChange={e => setOrgData({...orgData, type: e.target.value})}
                                >
                                    <option value="Retail">Retail</option>
                                    <option value="Wholesale">Wholesale</option>
                                    <option value="Service">Service</option>
                                    <option value="Mixed">Mixed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Currency</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    value={orgData.currency}
                                    onChange={e => setOrgData({...orgData, currency: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tax ID / PIN</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    value={orgData.taxId}
                                    onChange={e => setOrgData({...orgData, taxId: e.target.value})}
                                    placeholder="e.g. P051..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Contact</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    value={orgData.phone}
                                    onChange={e => setOrgData({...orgData, phone: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Support Email</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    value={orgData.email}
                                    onChange={e => setOrgData({...orgData, email: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Physical Address</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    value={orgData.address}
                                    onChange={e => setOrgData({...orgData, address: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Update Organization'}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'Security' && (
                <div className="space-y-6">
                    <form onSubmit={handlePasswordUpdate} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Change Password</h3>
                            <p className="text-xs text-slate-500">Ensure your account is using a long, random password.</p>
                        </div>
                        <div className="p-6 space-y-4 max-w-lg">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input 
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
                                        value={passwords.current}
                                        onChange={e => setPasswords({...passwords, current: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input 
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
                                        value={passwords.new}
                                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input 
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Login Activity</h3>
                            <p className="text-xs text-slate-500">Recent sessions for your account.</p>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Device</th>
                                    <th className="px-6 py-3">Location</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <tr>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <Monitor size={16} className="text-slate-400"/> Chrome on Windows
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">Nairobi, KE</td>
                                    <td className="px-6 py-4 text-slate-600">Current Session</td>
                                    <td className="px-6 py-4 text-right"><span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span></td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <Smartphone size={16} className="text-slate-400"/> Safari on iPhone
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">Mombasa, KE</td>
                                    <td className="px-6 py-4 text-slate-600">Oct 24, 2023 10:30 AM</td>
                                    <td className="px-6 py-4 text-right"><span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Expired</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'Notifications' && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Notification Preferences</h3>
                        <p className="text-xs text-slate-500">Choose how and when you want to be notified.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-slate-800">Email Notifications</h4>
                                <p className="text-xs text-slate-500">Receive daily summaries and critical alerts via email.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={notifications.emailOrderUpdates} onChange={() => setNotifications({...notifications, emailOrderUpdates: !notifications.emailOrderUpdates})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-slate-800">Low Stock Alerts</h4>
                                <p className="text-xs text-slate-500">Get notified when inventory items reach their threshold.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={notifications.emailLowStock} onChange={() => setNotifications({...notifications, emailLowStock: !notifications.emailLowStock})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-slate-800">SMS Notifications</h4>
                                <p className="text-xs text-slate-500">Receive urgent updates on your phone.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={notifications.smsUrgent} onChange={() => setNotifications({...notifications, smsUrgent: !notifications.smsUrgent})} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Right Col - Stats or Quick Info */}
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <History size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Account Age</h4>
                        <p className="text-xs text-slate-500">Member since 2023</p>
                    </div>
                </div>
                <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Role</span>
                        <span className="font-medium">{currentUser.role}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Status</span>
                        <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">{currentUser.status}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Last Login</span>
                        <span className="font-medium">{currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : 'Never'}</span>
                     </div>
                </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl shadow-sm p-6">
                <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} /> Danger Zone
                </h4>
                <p className="text-xs text-red-600 mb-4">
                    Sign out of your account on all devices or deactivate your profile.
                </p>
                <button 
                    onClick={logout}
                    className="w-full bg-white border border-red-200 text-red-600 font-medium py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
