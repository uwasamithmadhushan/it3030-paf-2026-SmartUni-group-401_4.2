import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, getAllAssets } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useEffect } from 'react';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IT_SUPPORT',
    priority: 'MEDIUM',
    resourceId: '',
    location: '',
    contactDetails: '',
    attachments: []
  });
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data } = await getAllAssets();
        setAssets(data);
      } catch (err) {
        addToast('Could not load assets list', 'error');
      }
    };
    fetchAssets();
  }, [addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.length < 5) {
      addToast('Title is too short (min 5 chars)', 'error');
      return;
    }
    if (formData.description.length < 10) {
      addToast('Please provide a more detailed description', 'error');
      return;
    }

    setLoading(true);
    try {
      await createTicket(formData);
      addToast('Ticket submitted successfully!', 'success');
      navigate('/tickets');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit ticket.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      addToast('Maximum 3 attachments allowed', 'error');
      return;
    }
    
    // In a real app, you'd upload these to S3/Cloudinary and get URLs
    // For this simulation, we'll store mock attachment objects
    const mockAttachments = files.map(file => ({
      filename: file.name,
      fileType: file.type,
      url: URL.createObjectURL(file) // Local preview URL
    }));

    setFormData({ ...formData, attachments: mockAttachments });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <LoadingSpinner fullScreen message="Submitting your request..." />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 relative z-0">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/tickets')}
          className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Support Hub
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden relative">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-10 py-16 text-white relative flex flex-col justify-center min-h-[200px]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/20">
                <span>📝 New Request</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight drop-shadow-md">Report an Issue</h1>
              <p className="text-indigo-100 text-lg opacity-90 max-w-xl font-medium">Help us keep the campus infrastructure running smoothly. Tell us what went wrong.</p>
            </div>
            {/* Abstract background shapes */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 mb-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">
            {/* Issue Title */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Issue Title</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Wi-Fi disconnected in Library Block B"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium shadow-sm hover:border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer font-bold text-slate-700 hover:border-slate-300"
                  >
                    <option value="IT_SUPPORT">💻 IT Support</option>
                    <option value="MAINTENANCE">🔧 Facility Maintenance</option>
                    <option value="SECURITY">🛡️ Security Incident</option>
                    <option value="LAB_EQUIPMENT">🔬 Lab Equipment</option>
                    <option value="OTHER">📁 Other</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              
              {/* Priority */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Priority Context</label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer font-bold text-slate-700 hover:border-slate-300"
                  >
                    <option value="LOW">🌴 Low (Minor inconvenience)</option>
                    <option value="MEDIUM">⚖️ Medium (Normal issue)</option>
                    <option value="HIGH">🔥 High (Affects multiple users)</option>
                    <option value="CRITICAL">🚨 Critical (Safety / Full Outage)</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Resource Mapping */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex justify-between">
                  <span>Target Resource</span>
                  <span className="text-indigo-400/80 font-semibold tracking-normal normal-case">Optional</span>
                </label>
                <div className="relative">
                  <select
                    name="resourceId"
                    value={formData.resourceId}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer font-bold text-slate-700 hover:border-slate-300"
                  >
                    <option value="">-- No specific resource --</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name} ({asset.location.substring(0, 15)})</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Exact Location</label>
                <input
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Room number, floor, or area"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium shadow-sm hover:border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Details */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Contact Callback</label>
                <input
                  required
                  name="contactDetails"
                  value={formData.contactDetails}
                  onChange={handleChange}
                  placeholder="Phone or extension number"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium shadow-sm hover:border-slate-300"
                />
              </div>

              {/* Advanced File Upload Dropzone */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex justify-between">
                  <span>Photo Evidence</span>
                  <span className="text-indigo-400/80 font-semibold tracking-normal normal-case">Max 3</span>
                </label>
                <div className="relative group cursor-pointer">
                  <div className={`absolute inset-0 bg-indigo-50/50 rounded-2xl border-2 border-dashed ${formData.attachments.length > 0 ? 'border-indigo-400 bg-indigo-50' : 'border-indigo-200 group-hover:border-indigo-400 group-hover:bg-indigo-50'} transition-all pointer-events-none`}></div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    title="Click to upload images"
                    className="w-full h-[60px] opacity-0 cursor-pointer object-cover z-20 relative"
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none z-10">
                    <span className={`font-bold ${formData.attachments.length > 0 ? 'text-indigo-700' : 'text-indigo-400 group-hover:text-indigo-600'}`}>
                      {formData.attachments.length > 0 ? `${formData.attachments.length} files attached` : 'Click or drop files here...'}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.attachments.length > 0 ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-100 text-indigo-500 group-hover:bg-indigo-200 group-hover:text-indigo-600'} transition-all`}>
                      {formData.attachments.length > 0 ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Detailed Description</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Provide as much detail as possible to help us reach a faster resolution..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium shadow-sm hover:border-slate-300 resize-none leading-relaxed"
              ></textarea>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                className="flex-1 px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Cancel Discard</span>
              </button>
              <button
                type="submit"
                className="flex-[2] relative overflow-hidden group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-150%] skew-x-[-15deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span>Submit Ticket Securely</span>
                  <svg className="w-5 h-5 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;
