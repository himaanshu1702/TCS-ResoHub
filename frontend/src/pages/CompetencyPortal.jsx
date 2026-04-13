import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { moduleAPI } from '../services/api';
import CorporateNavbar from '../components/CorporateNavbar';
import ModuleCard from '../components/ModuleCard';
import ResoBotWidget from '../components/ResoBotWidget';
import { 
  Sparkles, Layers, Plus, X, Loader, Trash2, CheckCircle, AlertCircle, Pin, Clock, Eraser, Filter 
} from 'lucide-react';

export default function CompetencyPortal() {
  const { user } = useContext(AuthContext);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- 1. FILTER STATE ---
  const [activeFilter, setActiveFilter] = useState('All');

  // --- 2. FAVORITES & HISTORY STATE ---
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('reso_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // SME & UI States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModule, setCurrentModule] = useState({ title: '', description: '', category: 'Technical' });
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const navigate = useNavigate();
  const isSME = user?.role === 'SME';

  useEffect(() => {
    loadModules();
    loadRecent();
  }, []);

  const loadRecent = () => {
    const saved = localStorage.getItem('reso_recent');
    if (saved) setRecentlyViewed(JSON.parse(saved));
  };

  const loadModules = async () => {
    try {
      const response = await moduleAPI.getAll();
      setModules(response.data);
    } catch (error) {
      console.error('Failed to load knowledge modules:', error);
      showToast("Failed to load modules from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- SMART FILTER HANDLERS ---
  const handleTagClick = (category) => {
    setActiveFilter(category);
    showToast(`Filtered by ${category}`, "success");
  };

  const clearFilter = () => {
    setActiveFilter('All');
  };

  // --- HISTORY HANDLERS ---
  const clearAllRecent = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('reso_recent');
    showToast("History cleared successfully.", "success");
  };

  const removeRecentItem = (moduleId) => {
    const updatedList = recentlyViewed.filter(id => id !== moduleId);
    setRecentlyViewed(updatedList);
    localStorage.setItem('reso_recent', JSON.stringify(updatedList));
    showToast("Removed from history.", "success");
  };

  // --- FAVORITE HANDLER ---
  const toggleFavorite = (moduleId) => {
    let newFavorites;
    if (favorites.includes(moduleId)) {
      newFavorites = favorites.filter(id => id !== moduleId);
      showToast("Removed from Pinned Resources", "success");
    } else {
      newFavorites = [...favorites, moduleId];
      showToast("Pinned to top successfully!", "success");
    }
    setFavorites(newFavorites);
    localStorage.setItem('reso_favorites', JSON.stringify(newFavorites));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // --- CRUD Handlers ---
  const handleCreateClick = () => {
    setCurrentModule({ title: '', description: '', category: 'Technical' });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (module) => {
    setCurrentModule(module);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = (moduleId) => {
    setModuleToDelete(moduleId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!moduleToDelete) return;
    setActionLoading(true);
    try {
      await moduleAPI.delete(moduleToDelete);
      showToast("Module deleted successfully.", "success");
      loadModules();
      
      if (favorites.includes(moduleToDelete)) {
        const newFavs = favorites.filter(id => id !== moduleToDelete);
        setFavorites(newFavs);
        localStorage.setItem('reso_favorites', JSON.stringify(newFavs));
      }
      if (recentlyViewed.includes(moduleToDelete)) {
        const newRecent = recentlyViewed.filter(id => id !== moduleToDelete);
        setRecentlyViewed(newRecent);
        localStorage.setItem('reso_recent', JSON.stringify(newRecent));
      }
    } catch (error) {
      showToast("Failed to delete module.", "error");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setModuleToDelete(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (isEditing) {
        await moduleAPI.update(currentModule.id, currentModule);
        showToast("Module updated successfully!", "success");
      } else {
        await moduleAPI.create(currentModule);
        showToast("New Module created successfully!", "success");
      }
      setShowModal(false);
      loadModules(); 
    } catch (error) {
      showToast("Operation failed. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // --- FILTERING LOGIC ---
  const filterFn = (m) => activeFilter === 'All' || m.category === activeFilter;

  const filteredModulesList = modules.filter(filterFn);
  const pinnedModules = filteredModulesList.filter(m => favorites.includes(m.id));
  const recentModules = recentlyViewed
    .map(id => modules.find(m => m.id === id))
    .filter(Boolean)
    .filter(filterFn); 

  const categories = ['All', 'Technical', 'Compliance', 'Soft Skills', 'Management'];

  return (
    <div className="min-h-screen pb-12 bg-reso-pale relative">
      <CorporateNavbar />

      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-fade-in ${
          toast.type === 'success' ? 'bg-reso-deep text-white border border-reso-royal' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} className="text-green-400"/> : <AlertCircle size={20}/>}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative bg-reso-royal text-white py-12 px-6 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-2">
            <Sparkles size={24} className="text-yellow-300" />
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-purple-200 max-w-2xl">
            {isSME 
              ? "Manage your Knowledge Modules and review Associate performance."
              : "Access your assigned Knowledge Modules and review SOPs."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-10">
        
        {/* --- 1. HORIZONTAL SMART FILTER BAR (NEW) --- */}
        <div className="flex flex-wrap items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-2 mr-2 text-reso-mauve font-bold uppercase text-xs tracking-wider">
             <Filter size={16} /> Filters:
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all transform hover:scale-105 border ${
                activeFilter === cat 
                  ? 'bg-reso-royal text-white border-reso-royal shadow-lg shadow-reso-royal/20' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-reso-royal hover:text-reso-royal'
              }`}
            >
              {cat}
            </button>
          ))}
          {activeFilter !== 'All' && (
             <button onClick={clearFilter} className="ml-auto text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
               <X size={14} /> Clear
             </button>
          )}
        </div>

        {/* --- 2. PINNED RESOURCES --- */}
        {pinnedModules.length > 0 && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-2 mb-6">
                <Pin size={20} className="text-reso-royal fill-reso-royal" />
                <h2 className="text-xl font-bold text-reso-deep font-display">Pinned Resources</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pinnedModules.map(module => (
                  <ModuleCard 
                    key={module.id} 
                    module={module} 
                    onClick={(id) => navigate(`/module/${id}`)}
                    isSME={isSME}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                    onTagClick={handleTagClick}
                  />
                ))}
             </div>
             <div className="h-px bg-gray-200 mt-10 w-full"></div>
          </div>
        )}

        {/* --- 3. RECENTLY VIEWED (With Clear History) --- */}
        {recentModules.length > 0 && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                  <Clock size={20} className="text-reso-mauve" />
                  <h2 className="text-xl font-bold text-reso-deep font-display">Recently Viewed</h2>
               </div>
               
               {/* CLEAR HISTORY BUTTON IS HERE */}
               <button 
                onClick={clearAllRecent}
                className="flex items-center gap-1.5 text-xs font-bold text-reso-mauve hover:text-red-500 bg-white/50 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
               >
                 <Eraser size={14} /> Clear History
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentModules.map(module => (
                  <ModuleCard 
                    key={module.id} 
                    module={module} 
                    onClick={(id) => navigate(`/module/${id}`)}
                    isSME={isSME}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    isFavorite={favorites.includes(module.id)}
                    onToggleFavorite={toggleFavorite}
                    onRemoveRecent={removeRecentItem} 
                    onTagClick={handleTagClick}
                  />
                ))}
             </div>
             <div className="h-px bg-gray-200 mt-10 w-full"></div>
          </div>
        )}

        {/* --- 4. ALL MODULES --- */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers size={20} className="text-reso-mauve" />
              <h2 className="text-xl font-bold text-reso-deep font-display">
                {activeFilter !== 'All' ? `${activeFilter} Modules` : (isSME ? "Managed Modules" : "All Knowledge Modules")}
              </h2>
            </div>

            {isSME && (
              <button 
                onClick={handleCreateClick}
                className="bg-reso-royal text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-reso-dark transition shadow-lg hover:shadow-reso-royal/30"
              >
                <Plus size={18} />
                Create Module
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/40 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : filteredModulesList.length === 0 ? (
            <div className="text-center py-12 bg-white/40 rounded-3xl border border-white/50">
              <p className="text-reso-mauve">No modules found matching "{activeFilter}".</p>
              <button onClick={clearFilter} className="mt-2 text-reso-royal font-bold hover:underline">Clear Filter</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredModulesList.map((module) => (
                <ModuleCard 
                  key={module.id} 
                  module={module} 
                  onClick={(id) => navigate(`/module/${id}`)}
                  isSME={isSME}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  isFavorite={favorites.includes(module.id)}
                  onToggleFavorite={toggleFavorite}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS (Create/Edit/Delete) - Preserved */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Module?</h3>
              <p className="text-gray-500 text-sm mb-6">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">Cancel</button>
                <button onClick={confirmDelete} disabled={actionLoading} className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition flex justify-center items-center gap-2">
                  {actionLoading ? <Loader size={16} className="animate-spin"/> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-reso-pale">
              <h3 className="font-bold text-reso-deep text-lg">{isEditing ? 'Edit Knowledge Module' : 'Create New Module'}</h3>
              <button onClick={() => setShowModal(false)} className="text-reso-mauve hover:text-reso-deep"><X size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-reso-mauve uppercase mb-1">Module Title</label>
                <input type="text" required value={currentModule.title} onChange={e => setCurrentModule({...currentModule, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-reso-royal/20 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-reso-mauve uppercase mb-1">Category</label>
                <select value={currentModule.category} onChange={e => setCurrentModule({...currentModule, category: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-reso-royal/20 focus:outline-none">
                  <option value="Technical">Technical</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-reso-mauve uppercase mb-1">Description</label>
                <textarea required rows={4} value={currentModule.description} onChange={e => setCurrentModule({...currentModule, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-reso-royal/20 focus:outline-none resize-none"/>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={actionLoading} className="w-full bg-reso-royal text-white py-3 rounded-xl font-semibold hover:bg-reso-dark transition shadow-lg flex justify-center gap-2 disabled:opacity-70">
                  {actionLoading ? <Loader className="animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Module')}
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