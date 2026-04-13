import React from 'react';
import { BookOpen, Edit, Trash2, Shield, Star, X } from 'lucide-react';

export default function ModuleCard({ 
  module, 
  onClick, 
  isSME, 
  onEdit, 
  onDelete, 
  isFavorite, 
  onToggleFavorite,
  onRemoveRecent, 
  onTagClick // <--- CHECK 1: This must be here
}) {
  
  const handleStarClick = (e) => {
    e.stopPropagation(); 
    onToggleFavorite(module.id);
  };

  const handleRemoveRecent = (e) => {
    e.stopPropagation();
    if(onRemoveRecent) onRemoveRecent(module.id);
  };

  // --- CHECK 2: The Click Handler ---
  const handleBadgeClick = (e) => {
    e.stopPropagation(); // Prevents the card from opening
    console.log("Tag Clicked:", module.category); // Debugging
    if (onTagClick) onTagClick(module.category);
  };

  return (
    <div 
      onClick={() => onClick(module.id)}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 group relative hover:-translate-y-1"
    >
      {/* Remove History Button */}
      {onRemoveRecent && (
        <button
          onClick={handleRemoveRecent}
          className="absolute -top-3 -right-3 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-md p-1.5 rounded-full border border-gray-100 z-20 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100"
          title="Remove from history"
        >
          <X size={16} />
        </button>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        
        {/* --- CHECK 3: The Button Itself --- */}
        <button 
          onClick={handleBadgeClick}
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-transform hover:scale-105 ${
            module.category === 'Compliance' ? 'bg-red-50 text-red-600 hover:bg-red-100' :
            module.category === 'Technical' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' :
            module.category === 'Soft Skills' ? 'bg-purple-50 text-purple-600 hover:bg-purple-100' :
            'bg-orange-50 text-orange-600 hover:bg-orange-100'
          }`}
          title={`Filter by ${module.category}`}
        >
          {module.category}
        </button>

        {/* Favorite Star */}
        <button 
          onClick={handleStarClick}
          className={`p-2 rounded-full transition-all duration-300 ${
            isFavorite 
              ? 'bg-yellow-50 text-yellow-500 scale-110' 
              : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50/50'
          }`}
        >
          <Star size={20} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
        </button>
      </div>

      <h3 className="text-lg font-bold text-reso-deep mb-2 line-clamp-2 group-hover:text-reso-royal transition-colors">
        {module.title}
      </h3>
      <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
        {module.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Shield size={14} />
          <span className="truncate max-w-[120px]">{module.sme_name}</span>
        </div>

        {isSME ? (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(module)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={16} /></button>
            <button onClick={() => onDelete(module.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
          </div>
        ) : (
          <div className="bg-reso-pale p-2 rounded-lg group-hover:bg-reso-royal group-hover:text-white transition-colors">
             <BookOpen size={18} />
          </div>
        )}
      </div>
    </div>
  );
}