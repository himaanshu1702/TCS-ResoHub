import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moduleAPI, assetAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import CorporateNavbar from '../components/CorporateNavbar';
import ResoBotWidget from '../components/ResoBotWidget';
import { 
  ArrowLeft, FileText, Video, Download, BookOpen, Clock, Shield, 
  Upload, X, Image as ImageIcon, Loader, Trash2, Edit, CheckCircle, AlertCircle, Star
} from 'lucide-react';

export default function ModuleViewer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [module, setModule] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Toast States
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [currentAsset, setCurrentAsset] = useState({
    id: '', title: '', file_type: 'PDF', tags: '', file: null
  });

  // --- FAVORITES LOGIC ---
  const [isFavorite, setIsFavorite] = useState(false);

  const isSME = user?.role === 'SME';

  useEffect(() => {
    loadData();
    checkFavorite();
    addToRecentlyViewed(); // <--- NEW: Add to History
  }, [moduleId]);

  // --- NEW: Add to Recently Viewed History ---
  const addToRecentlyViewed = () => {
    const saved = localStorage.getItem('reso_recent');
    let recent = saved ? JSON.parse(saved) : [];
    
    // Remove if already exists (to move it to top)
    recent = recent.filter(id => id !== moduleId);
    
    // Add to front
    recent.unshift(moduleId);
    
    // Keep only last 3
    if (recent.length > 3) recent = recent.slice(0, 3);
    
    localStorage.setItem('reso_recent', JSON.stringify(recent));
  };

  const checkFavorite = () => {
    const saved = localStorage.getItem('reso_favorites');
    if (saved) {
      const favs = JSON.parse(saved);
      setIsFavorite(favs.includes(moduleId));
    }
  };

  const toggleFavorite = () => {
    const saved = localStorage.getItem('reso_favorites');
    let favs = saved ? JSON.parse(saved) : [];
    
    if (isFavorite) {
      favs = favs.filter(id => id !== moduleId);
      showToast("Removed from Favorites", "success");
      setIsFavorite(false);
    } else {
      favs.push(moduleId);
      showToast("Pinned to Favorites", "success");
      setIsFavorite(true);
    }
    localStorage.setItem('reso_favorites', JSON.stringify(favs));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const loadData = async () => {
    try {
      const moduleRes = await moduleAPI.getAll();
      const foundModule = moduleRes.data.find(m => m.id === moduleId);
      setModule(foundModule);

      if (foundModule) {
        const assetRes = await assetAPI.getByModule(moduleId);
        setAssets(assetRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers (Create/Edit/Delete - Same as before) ---
  const handleCreateClick = () => {
    setCurrentAsset({ id: '', title: '', file_type: 'PDF', tags: '', file: null });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (asset) => {
    setCurrentAsset({ ...asset, file: null });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = (assetId) => {
    setAssetToDelete(assetId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    
    setActionLoading(true);
    try {
      await assetAPI.delete(assetToDelete);
      showToast("Asset deleted permanently.", "success");
      loadData();
    } catch (error) {
      showToast("Failed to delete asset.", "error");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setAssetToDelete(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setCurrentAsset({ ...currentAsset, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (isEditing) {
        await assetAPI.update(currentAsset.id, {
          title: currentAsset.title,
          file_type: currentAsset.file_type,
          tags: currentAsset.tags
        });
        showToast("Changes saved successfully!", "success");
      } else {
        if (!currentAsset.file) {
          showToast("Please select a file to upload.", "error");
          setActionLoading(false);
          return;
        }
        
        const formData = new FormData();
        formData.append('file', currentAsset.file);
        formData.append('title', currentAsset.title);
        formData.append('file_type', currentAsset.file_type);
        formData.append('tags', currentAsset.tags);
        
        await assetAPI.upload(moduleId, formData);
        showToast("File uploaded successfully.", "success");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      showToast("Operation failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-reso-pale flex items-center justify-center text-reso-royal animate-pulse">Loading Assets...</div>;
  if (!module) return <div className="min-h-screen bg-reso-pale flex items-center justify-center text-reso-deep">Module Not Found.</div>;

  return (
    <div className="min-h-screen bg-reso-pale pb-12 relative">
      <CorporateNavbar />

      {toast.show && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-fade-in ${
          toast.type === 'success' ? 'bg-reso-deep text-white border border-reso-royal' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} className="text-green-400"/> : <AlertCircle size={20}/>}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <button 
          onClick={() => navigate('/portal')}
          className="flex items-center gap-2 text-reso-mauve hover:text-reso-deep mb-6 transition-colors group"
        >
          <div className="bg-white p-2 rounded-full shadow-sm group-hover:-translate-x-1 transition-transform">
            <ArrowLeft size={18} />
          </div>
          <span className="font-medium">Back to Competency Portal</span>
        </button>

        {/* Header */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-reso-royal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-reso-royal text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{module.category}</span>
                  <div className="flex items-center gap-1 text-reso-mauve text-sm">
                    <Clock size={14} /> <span>Est. 4 Hours</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-reso-deep mb-4">{module.title}</h1>
              </div>

              {/* STAR BUTTON INSIDE MODULE */}
              <button 
                onClick={toggleFavorite}
                className={`p-3 rounded-xl transition-all shadow-sm ${
                  isFavorite 
                    ? 'bg-yellow-50 text-yellow-500 border border-yellow-200' 
                    : 'bg-white text-gray-300 hover:text-yellow-400 hover:shadow-md'
                }`}
                title={isFavorite ? "Unpin this module" : "Pin this module"}
              >
                <Star size={24} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
              </button>
            </div>
            
            <p className="text-reso-deep/80 text-lg max-w-3xl leading-relaxed">{module.description}</p>
            <div className="mt-6 flex items-center gap-2 text-sm text-reso-mauve font-semibold bg-white/50 w-fit px-4 py-2 rounded-xl border border-white/50">
              <Shield size={16} className="text-reso-royal" /> SME Owner: {module.sme_name}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-reso-deep flex items-center gap-2 font-display">
            <BookOpen size={24} className="text-reso-mauve" /> Learning Resources
          </h2>
          {isSME && (
            <button 
              onClick={handleCreateClick}
              className="bg-reso-royal text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-reso-dark transition shadow-lg hover:shadow-reso-royal/30"
            >
              <Upload size={18} /> Upload Asset
            </button>
          )}
        </div>

        {/* Asset List */}
        {assets.length === 0 ? (
          <div className="text-center py-12 bg-white/40 rounded-3xl border border-white/50 border-dashed">
            <p className="text-reso-mauve">No digital assets uploaded yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-fade-in">
            {assets.map((asset) => (
              <div key={asset.id} className="group bg-white hover:bg-white/90 p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    asset.file_type === 'VIDEO' ? 'bg-red-50 text-red-600' : 
                    asset.file_type === 'IMAGE' ? 'bg-purple-50 text-purple-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {asset.file_type === 'VIDEO' ? <Video size={24} /> : 
                     asset.file_type === 'IMAGE' ? <ImageIcon size={24} /> :
                     <FileText size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-reso-deep text-lg group-hover:text-reso-royal transition-colors">{asset.title}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{asset.file_type} • {asset.tags}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a 
                    href={`http://localhost:5000/${asset.file_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-reso-pale text-reso-deep px-4 py-2 rounded-xl font-semibold text-sm hover:bg-reso-royal hover:text-white transition-all"
                  >
                    <Download size={16} /> View
                  </a>
                  
                  {isSME && (
                    <div className="flex gap-1 border-l border-gray-200 pl-3 ml-2">
                      <button 
                        onClick={() => handleEditClick(asset)}
                        className="p-2 text-reso-mauve hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Metadata"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(asset.id)}
                        className="p-2 text-reso-mauve hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete File"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CUSTOM DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete this Asset?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete this file? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition flex justify-center items-center gap-2"
                >
                  {actionLoading ? <Loader size={16} className="animate-spin"/> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE/EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-reso-pale">
              <h3 className="font-bold text-reso-deep text-lg flex items-center gap-2">
                {isEditing ? <Edit size={20}/> : <Upload size={20}/>} 
                {isEditing ? 'Edit Asset Details' : 'Upload Resource'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-reso-mauve hover:text-reso-deep"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!isEditing && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                  <div className="flex flex-col items-center gap-2 text-reso-mauve">
                    <Upload size={32} />
                    <span className="text-sm font-medium">{currentAsset.file ? currentAsset.file.name : "Click to select file"}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-reso-mauve uppercase mb-1">Title</label>
                <input 
                  type="text" required value={currentAsset.title}
                  onChange={e => setCurrentAsset({...currentAsset, title: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-reso-royal/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-reso-mauve uppercase mb-1">Type</label>
                  <select
                    value={currentAsset.file_type}
                    onChange={e => setCurrentAsset({...currentAsset, file_type: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-reso-royal/20 focus:outline-none"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="VIDEO">Video</option>
                    <option value="IMAGE">Image</option>
                    <option value="DOC">Word / Text</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-reso-mauve uppercase mb-1">Tags</label>
                  <input 
                    type="text" value={currentAsset.tags}
                    onChange={e => setCurrentAsset({...currentAsset, tags: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-reso-royal/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" disabled={actionLoading}
                  className="w-full bg-reso-royal text-white py-3 rounded-xl font-semibold hover:bg-reso-dark transition shadow-lg flex justify-center gap-2 disabled:opacity-70"
                >
                  {actionLoading ? <Loader className="animate-spin" /> : (isEditing ? 'Save Changes' : 'Upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ResoBotWidget />
    </div>
  );
}