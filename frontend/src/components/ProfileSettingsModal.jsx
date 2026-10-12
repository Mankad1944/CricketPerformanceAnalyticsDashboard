import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Lock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';

const ProfileSettingsModal = ({ isOpen, onClose, token, user }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        username: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && token) {
            const fetchProfile = async () => {
                setLoading(true);
                try {
                    const res = await axios.get('http://127.0.0.1:8000/api/users/me/', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFormData({
                        first_name: res.data.first_name || '',
                        last_name: res.data.last_name || '',
                        email: res.data.email || '',
                        username: res.data.username || '',
                        password: '',
                    });
                } catch (err) {
                    console.error("Failed to load profile", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
            setError('');
            setSuccess('');
        }
    }, [isOpen, token]);



    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');

        try {
            // Only send password if it's not empty
            const payload = { ...formData };
            if (!payload.password) {
                delete payload.password;
            }

            await axios.put('http://127.0.0.1:8000/api/users/me/update/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 1500);

        } catch (err) {
            console.error(err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-sm p-4">
            <div className="bg-[#0f172a] rounded-3xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Account Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-500 text-sm font-bold">
                            <CheckCircle2 size={18} /> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Username (Account ID)</label>
                            <div className="relative opacity-70">
                                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    readOnly
                                    className="w-full bg-[#0b1120] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-400 font-bold focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">First Name</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full bg-[#0b1120] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="First"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full bg-[#0b1120] border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Last"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0b1120] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">New Password (Optional)</label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-[#0b1120] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Only fill this if you want to change your password.</p>
                        </div>

                        <div className="pt-4 mt-6 border-t border-white/5 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;
