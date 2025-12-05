import React from 'react';
import { Layers, Image, Type, Settings, Plus, FileText, AlertTriangle } from 'lucide-react';
import { AppState, Page, Asset } from '../types';

interface SidebarProps {
  state: AppState;
  onPageSelect: (id: string) => void;
  onTabChange: (tab: AppState['ui']['leftPanelTab']) => void;
  onAddPage: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onPageSelect, onTabChange, onAddPage }) => {
  const { ui, project } = state;

  return (
    <div className="w-64 bg-app-panel border-r border-app-border flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Tabs */}
      <div className="flex border-b border-app-border">
        <button
          onClick={() => onTabChange('pages')}
          title="Páginas"
          className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${
            ui.leftPanelTab === 'pages' 
              ? 'border-app-accent text-app-text' 
              : 'border-transparent text-app-muted hover:text-app-text'
          }`}
        >
          <Layers size={18} />
        </button>
        <button
          onClick={() => onTabChange('assets')}
          title="Ativos"
          className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${
            ui.leftPanelTab === 'assets' 
              ? 'border-app-accent text-app-text' 
              : 'border-transparent text-app-muted hover:text-app-text'
          }`}
        >
          <Image size={18} />
        </button>
        <button
          onClick={() => onTabChange('structure')}
          title="Estrutura e TOC"
          className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${
            ui.leftPanelTab === 'structure' 
              ? 'border-app-accent text-app-text' 
              : 'border-transparent text-app-muted hover:text-app-text'
          }`}
        >
          <Type size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {ui.leftPanelTab === 'pages' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-app-muted uppercase tracking-wider">Páginas ({project.pages.length})</h3>
                <button onClick={onAddPage} title="Adicionar Página" className="p-1 hover:bg-app-bg rounded text-app-accent">
                    <Plus size={16} />
                </button>
             </div>
            <div className="grid grid-cols-2 gap-3">
              {project.pages.map((page, index) => (
                <div
                  key={page.id}
                  onClick={() => onPageSelect(page.id)}
                  className={`relative group cursor-pointer flex flex-col gap-1 ${
                    ui.activePageId === page.id ? 'ring-2 ring-app-accent rounded' : ''
                  }`}
                >
                  <div className="aspect-[2/3] bg-white text-black text-[4px] p-2 overflow-hidden shadow-sm hover:shadow-md transition-all rounded-sm">
                     {/* Thumbnail simulation */}
                     <div className="w-full h-full flex flex-col gap-1 opacity-50">
                        {page.elements.slice(0, 3).map((el, i) => (
                             <div key={i} className="bg-neutral-300 w-full h-1 rounded-full"></div>
                        ))}
                     </div>
                  </div>
                  <div className="flex justify-center">
                    <span className={`text-xs ${ui.activePageId === page.id ? 'text-app-accent font-medium' : 'text-app-muted'}`}>
                        {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ui.leftPanelTab === 'assets' && (
           <div className="space-y-4">
               <h3 className="text-xs font-bold text-app-muted uppercase tracking-wider mb-3">Biblioteca de Ativos</h3>
               <div className="grid grid-cols-2 gap-2">
                    {project.assets.map(asset => (
                        <div key={asset.id} className="relative group rounded border border-app-border bg-app-bg overflow-hidden">
                             <img src={asset.url} alt={asset.name} className="w-full aspect-square object-cover" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <span className="text-[10px] text-white font-mono">{asset.dimensions}</span>
                             </div>
                        </div>
                    ))}
                    {/* Upload Placeholder */}
                    <div className="aspect-square rounded border border-dashed border-app-border flex flex-col items-center justify-center text-app-muted hover:border-app-accent hover:text-app-accent cursor-pointer transition-colors">
                        <Plus size={24} />
                        <span className="text-[10px] mt-1">Carregar</span>
                    </div>
               </div>
           </div>
        )}

        {ui.leftPanelTab === 'structure' && (
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-app-muted uppercase tracking-wider mb-3">Sumário (TOC)</h3>
                <div className="flex items-center gap-2 text-sm text-app-text p-2 hover:bg-app-bg rounded cursor-pointer">
                    <FileText size={14} className="text-app-accent" />
                    <span className="font-serif">Prefácio</span>
                </div>
                 <div className="flex items-center gap-2 text-sm text-app-text p-2 hover:bg-app-bg rounded cursor-pointer pl-4">
                    <span className="text-app-muted text-xs">1</span>
                    <span className="font-serif font-bold">O Início</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-app-text p-2 hover:bg-app-bg rounded cursor-pointer pl-4">
                    <span className="text-app-muted text-xs">2</span>
                    <span className="font-serif font-bold">O Conflito</span>
                </div>
                <div className="mt-8 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
                    <div className="flex items-center gap-2 text-yellow-500 mb-1">
                        <AlertTriangle size={14} />
                        <span className="text-xs font-bold">Verificação Preflight</span>
                    </div>
                    <p className="text-[10px] text-yellow-200/80">
                        3 imagens sem texto alternativo.<br/>
                        1 excesso de texto (overset) na Pág 4.
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};