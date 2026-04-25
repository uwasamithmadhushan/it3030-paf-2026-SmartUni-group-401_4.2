import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { createTicket, getAllResources, uploadAttachment } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  X, 
  AlertTriangle,
  MapPin,
  Tag,
  Layers,
  Phone,
  FileText,
  Building2,
  ShieldCheck,
  Zap,
  Activity,
  Globe,
  Plus,
  User,
  Mail
} from 'lucide-react';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { refreshTickets } = useOutletContext() || {};
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ELECTRICAL',
    priority: 'MEDIUM',
    resourceId: '',
    location: '',
    preferredContactName: '',
    preferredContactEmail: '',
    preferredContactPhone: '',
    attachments: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data } = await getAllResources({ size: 1000 });
        setAssets(data.content || data);
      } catch (err) {
        addToast('Registry synchronization failed', 'error');
      }
    };
    fetchAssets();
  }, [addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation before sending to backend
    if (!formData.title || formData.title.trim().length < 5) {
      addToast('Please enter an issue title (at least 5 characters).', 'error');
      return;
    }
    if (!formData.category) {
      addToast('Please select a category.', 'error');
      return;
    }
    if (!formData.priority) {
      addToast('Please select a priority.', 'error');
      return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      addToast('Please provide a description (at least 10 characters).', 'error');
      return;
    }
    if (!formData.preferredContactName || !formData.preferredContactName.trim()) {
      addToast('Please enter a contact name.', 'error');
      return;
    }
    if (!formData.preferredContactEmail || !formData.preferredContactEmail.trim()) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    if (!formData.preferredContactPhone || !formData.preferredContactPhone.trim()) {
      addToast('Please enter a contact phone number.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        location: formData.location.trim(),
        resourceId: formData.resourceId || null,
        preferredContactName: formData.preferredContactName.trim(),
        preferredContactEmail: formData.preferredContactEmail.trim(),
        preferredContactPhone: formData.preferredContactPhone.trim(),
        attachments: []
      };

      const { data: newTicket } = await createTicket(payload);
      
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            await uploadAttachment(newTicket.id, file);
          } catch (uploadErr) {
            console.error('File upload error:', uploadErr);
          }
        }
      }

      addToast('Your incident report has been submitted successfully!', 'success');
      if (refreshTickets) refreshTickets();
      navigate('/tickets');
    } catch (error) {
      // Extract the real validation message from the backend response
      const responseData = error.response?.data;
      let msg = 'Failed to submit report. Please check all fields and try again.';
      if (typeof responseData === 'string') msg = responseData;
      else if (responseData?.message) msg = responseData.message;
      else if (responseData?.errors) msg = Object.values(responseData.errors).join(' ');
      addToast(msg, 'error');
      console.error('Ticket submission error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.attachments.length + files.length > 3) {
      addToast('Maximum 3 images allowed.', 'error');
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

  if (loading) return <LoadingSpinner fullScreen message="Submitting your report..." />;

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-20">
      
      {/* Dynamic Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/tickets')}
          className="group flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-luna-aqua transition-all"
        >
          <div className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center group-hover:luna-glow">
            <ArrowLeft size={16} />
          </div>
          Back to My Requests
        </button>
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-luna-aqua" />
          <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.3em]">Secure Terminal #401-Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Main Reporting Interface */}
        <div className="xl:col-span-8">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="luna-card !p-0 overflow-hidden"
           >
              {/* Report Header */}
              <div className="p-12 border-b border-luna-aqua/10 relative overflow-hidden bg-gradient-to-br from-luna-midnight/60 to-transparent">
                 <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none translate-x-20 -translate-y-20">
                   <AlertTriangle size={320} />
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <Zap className="text-luna-aqua" size={20} />
                      <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.3em]">Operational Anomaly</span>
                   </div>
                   <h1 className="text-5xl font-black text-white tracking-tighter">Report New <span className="text-luna-aqua">Incident</span></h1>
                   <p className="text-text-muted font-medium mt-4 text-lg max-w-xl">Submit a maintenance or facility issue for technician review and support.</p>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="p-12 space-y-12">
                 {/* Section: Core Intelligence */}
                 <div className="space-y-10">
                    <div className="flex items-center gap-4 text-white border-l-4 border-luna-aqua pl-6">
                       <FileText size={20} className="text-luna-aqua" />
                       <h3 className="text-xs font-black uppercase tracking-[0.3em]">Incident Information</h3>
                    </div>

                    <div className="space-y-8">
                       <div className="group">
                         <label className="luna-label">Issue Title</label>
                         <div className="relative">
                            <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                            <input
                              required
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              placeholder="Briefly describe the issue"
                              className="luna-input !pl-16"
                            />
                         </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="group">
                            <label className="luna-label">Category</label>
                            <div className="relative">
                              <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                              <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="luna-input !pl-16 appearance-none cursor-pointer"
                              >
                                <option value="ELECTRICAL">Electrical</option>
                                <option value="NETWORK">Network</option>
                                <option value="FURNITURE">Furniture</option>
                                <option value="EQUIPMENT">Equipment</option>
                                <option value="CLEANING">Cleaning</option>
                                <option value="SAFETY">Safety</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="group">
                            <label className="luna-label">Priority</label>
                            <div className="relative">
                              <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                              <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="luna-input !pl-16 appearance-none cursor-pointer"
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                              </select>
                            </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Section: Logistical Context */}
                 <div className="space-y-10">
                    <div className="flex items-center gap-4 text-white border-l-4 border-luna-cyan pl-6">
                       <MapPin size={20} className="text-luna-cyan" />
                       <h3 className="text-xs font-black uppercase tracking-[0.3em]">Location Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="group">
                          <label className="luna-label">Related Resource</label>
                          <div className="relative">
                            <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-cyan transition-colors" size={20} />
                            <select
                              name="resourceId"
                              value={formData.resourceId}
                              onChange={handleChange}
                              className="luna-input !pl-16 appearance-none cursor-pointer"
                            >
                              <option value="">No Specific Resource</option>
                              {assets.map(asset => (
                                <option key={asset.id} value={asset.id}>{asset.name} - {asset.location}</option>
                              ))}
                            </select>
                          </div>
                       </div>
                       
                       <div className="group">
                          <label className="luna-label">Exact Location</label>
                          <div className="relative">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-cyan transition-colors" size={20} />
                            <input
                              required
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="Example: Lab 404, Block B, Floor 4"
                              className="luna-input !pl-16"
                            />
                          </div>
                       </div>

                       <div className="group">
                          <label className="luna-label">Contact Name</label>
                          <div className="relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-cyan transition-colors" size={20} />
                            <input
                              required
                              name="preferredContactName"
                              value={formData.preferredContactName}
                              onChange={handleChange}
                              placeholder="Enter your name"
                              className="luna-input !pl-16"
                            />
                          </div>
                       </div>

                       <div className="group">
                          <label className="luna-label">Contact Email</label>
                          <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-cyan transition-colors" size={20} />
                            <input
                              required
                              type="email"
                              name="preferredContactEmail"
                              value={formData.preferredContactEmail}
                              onChange={handleChange}
                              placeholder="Enter email address"
                              className="luna-input !pl-16"
                            />
                          </div>
                       </div>

                       <div className="group">
                          <label className="luna-label">Contact Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-cyan transition-colors" size={20} />
                            <input
                              required
                              name="preferredContactPhone"
                              value={formData.preferredContactPhone}
                              onChange={handleChange}
                              placeholder="Enter phone number"
                              className="luna-input !pl-16"
                            />
                          </div>
                       </div>

                       <div className="group">
                          <label className="luna-label">Attach Images (Max 3)</label>
                          <label className="luna-input flex items-center justify-between cursor-pointer hover:border-luna-cyan/30 transition-all !px-6 group-hover:luna-glow-inset">
                             <div className="flex items-center gap-4 overflow-hidden">
                                <Paperclip size={20} className="text-text-muted shrink-0" />
                                <span className="text-sm font-medium text-text-muted truncate">
                                   {selectedFiles.length > 0 ? `${selectedFiles.length} image(s) selected` : 'Upload images related to the issue'}
                                </span>
                             </div>
                             <div className="w-8 h-8 luna-glass rounded-lg flex items-center justify-center text-luna-cyan">
                                <Plus size={16} />
                             </div>
                             <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                       </div>
                    </div>
                 </div>

                 {/* Section: Intelligence Narrative */}
                 <div className="space-y-10">
                    <div className="flex items-center gap-4 text-white border-l-4 border-white pl-6">
                       <Zap size={20} className="text-white" />
                       <h3 className="text-xs font-black uppercase tracking-[0.3em]">Additional Details</h3>
                    </div>

                    <div className="group">
                       <label className="luna-label">Description</label>
                       <textarea
                         required
                         name="description"
                         value={formData.description}
                         onChange={handleChange}
                         rows="8"
                         placeholder="Describe the issue in detail, including what happened and any visible damage."
                         className="luna-input !p-8 resize-none text-base leading-relaxed"
                       ></textarea>
                    </div>
                 </div>

                 {/* Action Command Bar */}
                 <div className="flex items-center justify-end gap-10 pt-12 border-t border-luna-aqua/10">
                    <button
                      type="button"
                      onClick={() => navigate('/tickets')}
                      className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="luna-button !px-16 !py-5 shadow-2xl shadow-luna-aqua/20 text-xs tracking-[0.3em]"
                    >
                      {loading ? 'Submitting...' : 'Submit Report'} <Send size={20} />
                    </button>
                 </div>
              </form>
           </motion.div>
        </div>

        {/* Support Sidebar */}
        <div className="xl:col-span-4 space-y-12">
           <div className="luna-card !bg-luna-midnight/60 border-luna-aqua/10 !p-12">
              <div className="w-20 h-20 bg-luna-aqua/5 rounded-[2.5rem] flex items-center justify-center text-luna-aqua mb-10 border border-luna-aqua/20 luna-glow">
                 <ShieldCheck size={36} />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mb-4">Submission Protocol</h3>
              <p className="text-sm font-medium text-text-muted mb-10 leading-relaxed border-l-2 border-luna-aqua/20 pl-8">
                 Every report is encrypted and synchronized with our high-end technician dispatch matrix for optimal resolution velocity.
              </p>
              
              <div className="space-y-6">
                 <ProtocolStep label="Data Encryption" status="Optimal" />
                 <ProtocolStep label="Identity Sync" status="Verified" />
                 <ProtocolStep label="Asset Validation" status="Live" />
              </div>
           </div>

           <div className="luna-card !bg-gradient-to-br from-luna-steel/10 to-transparent border-transparent text-center !p-12">
              <Globe size={48} className="text-luna-aqua mx-auto mb-8 animate-pulse opacity-50" />
              <h4 className="text-lg font-black text-white uppercase tracking-widest mb-4">Global Network</h4>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-10">Real-time infrastructure monitoring active across all sectors.</p>
              <div className="w-full h-1 bg-luna-aqua/10 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ x: ['-100%', '100%'] }} 
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="w-1/2 h-full bg-luna-aqua luna-glow"
                 />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const ProtocolStep = ({ label, status }) => (
  <div className="flex items-center justify-between p-5 luna-glass rounded-2xl border border-luna-aqua/5 group hover:border-luna-aqua/20 transition-all">
     <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
     <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-luna-aqua animate-pulse" />
        <span className="text-[9px] font-black text-luna-aqua uppercase tracking-widest">{status}</span>
     </div>
  </div>
);
