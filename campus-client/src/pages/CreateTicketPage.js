import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IT_SUPPORT',
    priority: 'MEDIUM'
  });

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
      addToast('Ticket submitted successfully! We will look into it.', 'success');
      navigate('/tickets');
    } catch (error) {
      addToast('Failed to submit ticket. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <LoadingSpinner fullScreen message="Submitting your request..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200 overflow-hidden border border-gray-50">
        <div className="bg-indigo-600 px-10 py-16 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-3 tracking-tight">Report an Issue</h1>
            <p className="text-indigo-100 text-lg opacity-90 max-w-md">Help us keep the campus running smoothly. Tell us what went wrong.</p>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 ml-10 mb-10 w-40 h-40 bg-indigo-400 rounded-full opacity-10 blur-2xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Issue Title</label>
            <input
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Wi-Fi disconnected in Library Block B"
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-all text-gray-800 font-medium placeholder:text-gray-300 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Category</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-all appearance-none cursor-pointer font-medium text-gray-700 bg-white"
                >
                  <option value="IT_SUPPORT">💻 IT Support</option>
                  <option value="MAINTENANCE">🔧 Facility Maintenance</option>
                  <option value="SECURITY">🛡️ Security Incident</option>
                  <option value="LAB_EQUIPMENT">🔬 Lab Equipment</option>
                  <option value="OTHER">📁 Other</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Priority</label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-all appearance-none cursor-pointer font-medium text-gray-700 bg-white"
                >
                  <option value="LOW">🌴 Low (Minor)</option>
                  <option value="MEDIUM">⚖️ Medium (Normal)</option>
                  <option value="HIGH">🔥 High (Urgent)</option>
                  <option value="CRITICAL">🚨 Critical (Emergency)</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Detailed Description</label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              placeholder="Provide as much detail as possible to help us reach a faster resolution..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-all text-gray-800 font-medium placeholder:text-gray-300 shadow-sm resize-none"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="flex-1 px-8 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;
