import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, LogOut, CheckCircle2, Lock, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function UserProfilePage() {
  const { user, logout, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', isError: false });
  const [pwdModal, setPwdModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await updateUserProfile({ name });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ text: '', isError: false });
    try {
      await api.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      setPwdMsg({ text: 'Password successfully changed.', isError: false });
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setPwdModal(false), 1500);
    } catch (err) {
      setPwdMsg({ text: err.response?.data?.detail || 'Failed to change password.', isError: true });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <User className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              Officer Profile & Telemetry Credentials
            </h2>
            <p className="text-xs text-stone-500">Manage environmental intelligence credentials and role assignments</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Profile Info Card */}
      <div className="card-white rounded-3xl p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-[#F2E8D5]">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shadow-sm"
            />
            <div>
              <h3 className="text-xl font-black text-stone-900">{user?.name || 'VayuNet Officer'}</h3>
              <p className="text-xs text-stone-500">{user?.email || 'officer@vayunet.gov.in'}</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  {user?.role || 'Environmental Analyst'}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  Provider: {user?.provider || 'local'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#FFFDF5] hover:bg-stone-100 border border-[#E2D6C0] text-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>{editing ? 'Cancel Editing' : 'Edit Profile'}</span>
            </button>
            <button
              onClick={() => setPwdModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {editing && (
          <form onSubmit={handleSaveProfile} className="p-4 bg-[#FFFDF5] border border-[#F2E8D5] rounded-2xl space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-stone-700">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E2D6C0] rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {saveLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#FFFDF5] border border-[#F2E8D5] rounded-2xl space-y-1">
            <span className="text-stone-400 font-medium">Account Identifier</span>
            <p className="font-mono font-bold text-stone-800">{user?.id || 'usr_node_local_01'}</p>
          </div>
          <div className="p-4 bg-[#FFFDF5] border border-[#F2E8D5] rounded-2xl space-y-1">
            <span className="text-stone-400 font-medium">Account Creation Timestamp</span>
            <p className="font-mono font-bold text-stone-800">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active 2026'}</p>
          </div>
          <div className="p-4 bg-[#FFFDF5] border border-[#F2E8D5] rounded-2xl space-y-1">
            <span className="text-stone-400 font-medium">Assigned Clearance Tier</span>
            <p className="font-bold text-stone-800">Tier 2 - State & National Environmental Access</p>
          </div>
          <div className="p-4 bg-[#FFFDF5] border border-[#F2E8D5] rounded-2xl space-y-1">
            <span className="text-stone-400 font-medium">Security Authentication Mode</span>
            <p className="font-bold text-stone-800">{user?.provider === 'google' ? 'Google SSO Token' : 'Salted SHA-256 / JWT'}</p>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {pwdModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE0CA] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-black text-stone-900 uppercase">Change Officer Password</h3>
              <button onClick={() => setPwdModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            {pwdMsg.text && (
              <div className={`p-3 rounded-xl ${pwdMsg.isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPwdModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
