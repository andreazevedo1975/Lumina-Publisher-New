
import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Ruler, Move, Grid, Quote, Heading, CaseUpper } from 'lucide-react';
import { AppState, ElementType, TypographyStyle } from '../types';

interface PropertyPanelProps {
  state: AppState;
  onUpdateStyle: (style: Partial<TypographyStyle>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ state, onUpdateStyle }) => {
  const selectedElements = state.ui.selectedElementIds.map(id => {
      // Find element in active page
      const page = state.project.pages.find(p => p.id === state.ui.activePageId);
      return page?.elements.find(e => e.id === id);
  }).filter(Boolean);

  const primarySelection = selectedElements[0];

  const getTypeName = (type: ElementType) => {
      switch(type) {
          case ElementType.TEXT_BLOCK: return "Texto";
          case ElementType.IMAGE: return "Imagem";
          case ElementType.SHAPE: return "Forma";
          default: return "Elemento";
      }
  };

  if (!primarySelection) {
    return (
        <div className="w-72 bg-app-panel border-l border-app-border flex flex-col p-6 text-center h-[calc(100vh-3.5rem)]">
             <div className="flex-1 flex flex-col items-center justify-center text-app-muted">
                <Grid size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Nenhuma seleção</p>
                <p className="text-xs opacity-50 mt-2">Selecione um elemento para editar suas propriedades.</p>
             </div>
        </div>
    );
  }

  return (
    <div className="w-72 bg-app-panel border-l border-app-border flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto custom-scrollbar">
       
       {/* Context Header */}
       <div className="px-4 py-3 border-b border-app-border bg-app-bg/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-app-accent flex items-center gap-2">
                {primarySelection.type === ElementType.TEXT_BLOCK && <Type size={14} />}
                {primarySelection.type === ElementType.IMAGE && <Grid size={14} />}
                Propriedades de {getTypeName(primarySelection.type)}
            </h2>
       </div>

       {primarySelection.type === ElementType.TEXT_BLOCK && (
           <>
            {/* Quick Styles / Presets */}
            <div className="p-4 border-b border-app-border space-y-3">
                 <span className="text-xs font-medium text-app-muted">Estilos Rápidos</span>
                 <div className="grid grid-cols-3 gap-2">
                     <button 
                        onClick={() => onUpdateStyle({ fontFamily: 'Inter', fontSize: 11, color: '#27272a', fontStyle: 'normal', paddingLeft: 0, fontWeight: 400 })}
                        className="flex flex-col items-center gap-1 p-2 bg-app-bg border border-app-border rounded hover:border-app-accent hover:text-app-accent transition-colors"
                        title="Corpo de Texto Padrão"
                     >
                         <AlignLeft size={16} />
                         <span className="text-[10px]">Corpo</span>
                     </button>
                     <button 
                        onClick={() => onUpdateStyle({ fontFamily: 'Merriweather', fontSize: 24, color: '#0ea5e9', fontStyle: 'normal', paddingLeft: 0, fontWeight: 700 })}
                        className="flex flex-col items-center gap-1 p-2 bg-app-bg border border-app-border rounded hover:border-app-accent hover:text-app-accent transition-colors"
                        title="Título H1"
                     >
                         <Heading size={16} />
                         <span className="text-[10px]">Título</span>
                     </button>
                     <button 
                        onClick={() => onUpdateStyle({ 
                            fontFamily: 'Merriweather', 
                            fontSize: 14, 
                            color: '#52525b', 
                            paddingLeft: 24, 
                            fontStyle: 'italic',
                            fontWeight: 400
                        })}
                        className="flex flex-col items-center gap-1 p-2 bg-app-bg border border-app-border rounded hover:border-app-accent hover:text-app-accent transition-colors"
                        title="Estilo de Citação"
                     >
                         <Quote size={16} />
                         <span className="text-[10px]">Citação</span>
                     </button>
                 </div>
            </div>

            {/* Typography Section */}
            <div className="p-4 border-b border-app-border space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-app-muted">Família da Fonte</span>
                </div>
                <select 
                    value={primarySelection.style.fontFamily || 'Inter'}
                    onChange={(e) => onUpdateStyle({ fontFamily: e.target.value })}
                    className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm text-app-text focus:border-app-accent focus:outline-none"
                >
                    <option value="Merriweather">Merriweather (Serif)</option>
                    <option value="Inter">Inter (Sans)</option>
                    <option value="Roboto Mono">Roboto Mono (Mono)</option>
                    <option value="Garamond">Garamond (Serif)</option>
                    <option value="Arial">Arial (Sans)</option>
                </select>

                <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-[10px] text-app-muted uppercase mb-1 block">Tamanho (pt)</label>
                        <input 
                            type="number" 
                            value={primarySelection.style.fontSize || 12} 
                            onChange={(e) => onUpdateStyle({ fontSize: Number(e.target.value) })}
                            className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm focus:border-app-accent focus:outline-none" 
                        />
                     </div>
                     <div>
                        <label className="text-[10px] text-app-muted uppercase mb-1 block">Entrelinha</label>
                        <input type="number" defaultValue={primarySelection.style.lineHeight} step="0.1" className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm focus:border-app-accent focus:outline-none" />
                     </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2">
                    <button 
                        onClick={() => onUpdateStyle({ fontWeight: primarySelection.style.fontWeight === 700 ? 400 : 700 })}
                        className={`flex-1 p-1 rounded text-xs border ${primarySelection.style.fontWeight === 700 ? 'bg-app-accent text-white border-app-accent' : 'bg-app-bg border-app-border text-app-muted'}`}
                    >
                        Negrito
                    </button>
                    <button 
                        onClick={() => onUpdateStyle({ fontStyle: primarySelection.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        className={`flex-1 p-1 rounded text-xs border ${primarySelection.style.fontStyle === 'italic' ? 'bg-app-accent text-white border-app-accent' : 'bg-app-bg border-app-border text-app-muted'}`}
                    >
                        Itálico
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                     <div>
                        <label className="text-[10px] text-app-muted uppercase mb-1 block">Tracking</label>
                        <input type="number" defaultValue={primarySelection.style.letterSpacing} className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm focus:border-app-accent focus:outline-none" />
                     </div>
                     <div>
                        <label className="text-[10px] text-app-muted uppercase mb-1 block">Cor</label>
                         <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={primarySelection.style.color || '#000000'}
                                onChange={(e) => onUpdateStyle({ color: e.target.value })}
                                className="w-6 h-6 rounded bg-transparent border-0 p-0 cursor-pointer"
                            />
                            <span className="text-xs font-mono text-app-muted uppercase">{primarySelection.style.color}</span>
                         </div>
                     </div>
                </div>
            </div>

            {/* Paragraph Section */}
            <div className="p-4 border-b border-app-border space-y-4">
                <span className="text-xs font-medium text-app-muted">Parágrafo</span>
                <div className="flex bg-app-bg rounded border border-app-border p-1 justify-between">
                    <button onClick={() => onUpdateStyle({ textAlign: 'left' })} className={`p-1 hover:bg-app-panel rounded ${primarySelection.style.textAlign === 'left' ? 'text-app-accent' : ''}`} title="Esquerda"><AlignLeft size={16}/></button>
                    <button onClick={() => onUpdateStyle({ textAlign: 'center' })} className={`p-1 hover:bg-app-panel rounded ${primarySelection.style.textAlign === 'center' ? 'text-app-accent' : ''}`} title="Centralizar"><AlignCenter size={16}/></button>
                    <button onClick={() => onUpdateStyle({ textAlign: 'right' })} className={`p-1 hover:bg-app-panel rounded ${primarySelection.style.textAlign === 'right' ? 'text-app-accent' : ''}`} title="Direita"><AlignRight size={16}/></button>
                    <button onClick={() => onUpdateStyle({ textAlign: 'justify' })} className={`p-1 hover:bg-app-panel rounded ${primarySelection.style.textAlign === 'justify' ? 'text-app-accent' : ''}`} title="Justificar"><AlignJustify size={16}/></button>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-app-text">Hifenização</span>
                    <input type="checkbox" checked={primarySelection.style.hyphenate} className="accent-app-accent" readOnly />
                </div>
                 <div className="grid grid-cols-2 gap-3 mt-2">
                     <div>
                        <label className="text-[10px] text-app-muted uppercase mb-1 block">Recuo (Indent)</label>
                        <input 
                            type="number" 
                            value={primarySelection.style.paddingLeft || 0} 
                            onChange={(e) => onUpdateStyle({ paddingLeft: Number(e.target.value) })}
                            className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm focus:border-app-accent focus:outline-none" 
                        />
                     </div>
                     <div>
                        <label className="text-[10px] text-app-muted uppercase mb-1 block">Espaço Depois</label>
                        <input type="number" defaultValue={6} className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm" />
                     </div>
                </div>
            </div>
           </>
       )}

       {/* Transform / Layout */}
       <div className="p-4 border-b border-app-border space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Ruler size={14} className="text-app-muted"/>
                <span className="text-xs font-medium text-app-muted">Transformar</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                    <div>
                    <label className="text-[10px] text-app-muted uppercase mb-1 block">Posição X</label>
                    <input type="number" value={Math.round(primarySelection.box.x)} className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm" readOnly />
                    </div>
                    <div>
                    <label className="text-[10px] text-app-muted uppercase mb-1 block">Posição Y</label>
                    <input type="number" value={Math.round(primarySelection.box.y)} className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm" readOnly />
                    </div>
                    <div>
                    <label className="text-[10px] text-app-muted uppercase mb-1 block">Largura</label>
                    <input type="number" value={Math.round(primarySelection.box.width)} className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm" readOnly />
                    </div>
                    <div>
                    <label className="text-[10px] text-app-muted uppercase mb-1 block">Altura</label>
                    <input type="number" value={Math.round(primarySelection.box.height)} className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm" readOnly />
                    </div>
            </div>
       </div>

       {/* Accessibility */}
       <div className="p-4 space-y-2">
             <span className="text-xs font-medium text-app-muted block">Acessibilidade (EPUB 3)</span>
             {primarySelection.type === ElementType.IMAGE && (
                 <div>
                    <label className="text-[10px] text-app-muted uppercase mb-1 block">Texto Alternativo (Alt Text)</label>
                    <textarea 
                        className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm h-20 resize-none focus:border-app-accent focus:outline-none" 
                        placeholder="Descreva a imagem..."
                        value={primarySelection.altText || ''}
                        readOnly
                    />
                    <button className="text-[10px] text-app-accent hover:underline mt-1">Gerar com IA</button>
                 </div>
             )}
              {primarySelection.type === ElementType.TEXT_BLOCK && (
                 <div>
                    <label className="text-[10px] text-app-muted uppercase mb-1 block">Função ARIA</label>
                    <select className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-sm">
                        <option value="doc-chapter">Capítulo (doc-chapter)</option>
                        <option value="doc-abstract">Resumo (doc-abstract)</option>
                        <option value="doc-footnote">Nota de Rodapé (doc-footnote)</option>
                        <option value="none">Nenhum (Corpo)</option>
                    </select>
                 </div>
             )}
       </div>

    </div>
  );
};
