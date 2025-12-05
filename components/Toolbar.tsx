import React from 'react';
import { 
  MousePointer2, Type, Image as ImageIcon, Hand, 
  ZoomIn, ZoomOut, Download, Save,
  Smartphone, FileText, Monitor, CheckCircle2, UploadCloud
} from 'lucide-react';
import { AppState } from '../types';

interface ToolbarProps {
  uiState: AppState['ui'];
  setUiState: React.Dispatch<React.SetStateAction<AppState['ui']>>;
  onExport: () => void;
  onAnalyze: () => void;
  onImportClick: () => void;
  isProcessing: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ uiState, setUiState, onExport, onAnalyze, onImportClick, isProcessing }) => {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Seleção (V)' },
    { id: 'text', icon: Type, label: 'Ferramenta de Texto (T)' },
    { id: 'image', icon: ImageIcon, label: 'Moldura de Imagem (F)' },
    { id: 'hand', icon: Hand, label: 'Ferramenta Mão (H)' },
  ];

  return (
    <div className="h-14 bg-app-panel border-b border-app-border flex items-center justify-between px-4 select-none">
      {/* Left: Branding & Tools */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center font-bold font-serif text-white">L</div>
            <span className="font-semibold text-app-text tracking-tight hidden md:block">Lumina</span>
        </div>

        <div className="h-6 w-px bg-app-border"></div>

        <div className="flex items-center bg-app-bg rounded-lg p-1 border border-app-border">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setUiState(prev => ({ ...prev, tool: tool.id as any }))}
              className={`p-2 rounded-md transition-colors ${
                uiState.tool === tool.id 
                  ? 'bg-app-accent text-white shadow-sm' 
                  : 'text-app-muted hover:text-app-text hover:bg-app-panel'
              }`}
              title={tool.label}
            >
              <tool.icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Center: Viewport Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-app-bg px-3 py-1.5 rounded-md border border-app-border">
            <Smartphone size={14} className="text-app-muted" title="Visualização Mobile" />
            <div className="w-px h-3 bg-app-border"></div>
            <FileText size={14} className="text-app-accent" title="Modo Página" />
            <div className="w-px h-3 bg-app-border"></div>
            <Monitor size={14} className="text-app-muted" title="Visualização Desktop" />
        </div>
        <span className="text-xs text-app-muted font-mono">{Math.round(uiState.zoom * 100)}%</span>
        <div className="flex items-center gap-1">
             <button 
                onClick={() => setUiState(prev => ({...prev, zoom: Math.max(0.2, prev.zoom - 0.1)}))}
                className="p-1.5 hover:bg-app-panel rounded text-app-text"
                title="Diminuir Zoom"
             >
                <ZoomOut size={16} />
             </button>
             <button 
                onClick={() => setUiState(prev => ({...prev, zoom: Math.min(3, prev.zoom + 0.1)}))}
                className="p-1.5 hover:bg-app-panel rounded text-app-text"
                title="Aumentar Zoom"
             >
                <ZoomIn size={16} />
             </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
         <button 
            onClick={onImportClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium text-app-text hover:bg-app-panel transition-colors border border-transparent hover:border-app-border"
            title="Importar Arquivo (PDF, DOCX, EPUB)"
         >
            <UploadCloud size={16} />
            <span className="hidden lg:inline">Importar</span>
         </button>

         <button 
            onClick={onAnalyze}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors ${isProcessing ? 'opacity-50' : ''}`}
            title="Analisar manuscrito e gerar layout automaticamente"
         >
            {isProcessing ? (
                <span className="animate-pulse">Analisando...</span>
            ) : (
                <>
                    <CheckCircle2 size={16} />
                    <span className="hidden lg:inline">Auto-Diagramação (IA)</span>
                </>
            )}
         </button>

        <div className="h-6 w-px bg-app-border"></div>

        <button className="text-app-muted hover:text-app-text p-2" title="Salvar Projeto">
            <Save size={18} />
        </button>
        <button 
            onClick={onExport}
            className="flex items-center gap-2 bg-app-accent hover:bg-sky-600 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow-lg shadow-sky-900/20 transition-all"
        >
          <Download size={16} />
          <span>Exportar</span>
        </button>
      </div>
    </div>
  );
};