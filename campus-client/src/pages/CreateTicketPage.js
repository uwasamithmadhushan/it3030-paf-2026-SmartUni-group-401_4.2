import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, getAllAssets, uploadAttachment } from '../services/api';
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
  const [selectedFiles, setSelectedFiles] = useState([]);
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
      const { data: newTicket } = await createTicket({ ...formData, attachments: [] });
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        addToast(`Uploading ${selectedFiles.length} attachments...`, 'info');
        for (const file of selectedFiles) {
          try {
            await uploadAttachment(newTicket.id, file);
          } catch (uploadErr) {
            console.error('File upload failed', uploadErr);
          }
        }
      }

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
    if (formData.attachments.length + files.length > 3) {
      addToast('Maximum 3 attachments allowed', 'error');
      return;
    }
    
    const newAttachments = files.map(file => ({
      filename: file.name,
      fileType: file.type,
      url: URL.createObjectURL(file)
    }));

    setFormData({ ...formData, attachments: [...formData.attachments, ...newAttachments] });
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <LoadingSpinner fullScreen message="Submitting your request..." />;

  if (loading) return <LoadingSpinner fullScreen message="Submitting your request..." />;

  return (
    <div className="py-8 flex justify-center px-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-[#5B5CE6] px-8 py-6 text-white flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold mb-1">New Incident Report</h1>
            <p className="text-indigo-100 text-sm">Please provide details about the issue.</p>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/tickets')}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            title="Cancel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Issue Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Issue Title</label>
            <input
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Wi-Fi disconnected in Library Block B"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5B5CE6] text-gray-900 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5B5CE6] text-gray-900 text-sm font-medium appearance-none cursor-pointer"
              >
                <option value="IT_SUPPORT">💻 IT Support</option>
                <option value="MAINTENANCE">🔧 Facility Maintenance</option>
                <option value="SECURITY">🛡️ Security Incident</option>
                <option value="LAB_EQUIPMENT">🔬 Lab Equipment</option>
                <option value="OTHER">📁 Other</option>
              </select>
            </div>
            
            {/* Priority */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5B5CE6] text-gray-900 text-sm font-medium appearance-none cursor-pointer"
              >
                <option value="LOW">🌴 Low</option>
                <option value="MEDIUM">⚖️ Medium</option>
                <option value="HIGH">🔥 High</option>
                <option value="CRITICAL">🚨 Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resource Mapping */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Related Asset (Optional)</label>
              <select
                name="resourceId"
                value={formData.resourceId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5B5CE6] text-gray-900 text-sm font-medium appearance-none cursor-pointer"
              >
                <option value="">-- No specific asset --</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name} ({asset.location.substring(0, 15)})</option>
                ))}
              </select>
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <input
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Room number, floor, or area"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5B5CE6] text-gray-900 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contact Details</label>
              <input
                required
                name="contactDetails"
                value={formData.contactDetails}
                onChange={handleChange}
                placeholder="Phone or extension number"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5B5CE6] text-gray-900 text-sm font-medium"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Attachments (Max 3)</label>
              <div className="relative group cursor-pointer h-[44px]">
                <div className={`absolute inset-0 rounded-xl border-2 border-dashed ${formData.attachments.length > 0 ? 'border-[#5B5CE6] bg-indigo-50/50' : 'border-gray-200 bg-gray-50 group-hover:border-[#5B5CE6]'} transition-all pointer-events-none`}></div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  title="Click to upload images"
                  className="w-full h-full opacity-0 cursor-pointer object-cover z-20 relative"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-4">
                  <span className={`text-sm font-bold ${formData.attachments.length > 0 ? 'text-[#5B5CE6]' : 'text-gray-400'}`}>
                    {formData.attachments.length > 0 ? `${formData.attachments.length} files attached` : 'Click to attach photos'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Provide as much detail as possible..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5B5CE6] text-gray-900 text-sm font-medium resize-none"
            ></textarea>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#5B5CE6] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
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
