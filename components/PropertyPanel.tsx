
import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Ruler, Move, Grid, Quote, Heading, Plus, Trash2, X, Palette } from 'lucide-react';
import { AppState, ElementType, TypographyStyle } from '../types';

interface PropertyPanelProps {
  state: AppState;
  onUpdateStyle: (style: Partial<TypographyStyle>) => void;
  onApplyParagraphStyle?: (id: string) => void;
  onAddParagraphStyle?: () => void;
  onRemoveParagraphStyle?: (id: string) => void;
  onAddSwatch?: (color: string) => void;
  onRemoveSwatch?: (color: string) => void;
}

// Lista categorizada de fontes disponíveis
const FONT_OPTIONS = [
  {
    category: "Serif (Clássico/Editorial)",
    fonts: [
      "Merriweather", "Libre Baskerville", "EB Garamond", "Playfair Display", 
      "Lora", "PT Serif", "Crimson Text", "Noto Serif", "Source Serif 4", 
      "Vollkorn", "Alegreya", "Frank Ruhl Libre", "Cardo", "Domine", 
      "Old Standard TT", "Spectral", "Zilla Slab", "Arvo", "Bitter", "Roboto Slab", "Prata", "Nanum Myeongjo", "Bodoni Moda"
    ]
  },
  {
    category: "Sans Serif (Moderno/Interface)",
    fonts: [
      "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", 
      "Raleway", "Nunito", "Work Sans", "Fira Sans", "Quicksand", 
      "Rubik", "Outfit", "Manrope", "DM Sans", "Mulish", "PT Sans", 
      "Karla", "Josefin Sans", "Ubuntu", "Titillium Web", "Heebo", "Source Sans 3", "Libre Franklin"
    ]
  },
  {
    category: "Display & Criativo",
    fonts: [
      "Oswald", "Bebas Neue", "Anton", "Abril Fatface", "Lobster", 
      "Dancing Script", "Pacifico", "Great Vibes", "Cinzel", 
      "Syne", "Space Grotesk", "Exo 2", "Archivo"
    ]
  },
  {
    category: "Monospace (Técnico)",
    fonts: [
      "Roboto Mono", "Fira Code", "Source Code Pro", "Inconsolata", "IBM Plex Mono"
    ]
  }
];

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
    state, 
    onUpdateStyle, 
    onApplyParagraphStyle, 
    onAddParagraphStyle, 
    onRemoveParagraphStyle,
    onAddSwatch,
    onRemoveSwatch
}) => {
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
            {/* Paragraph Styles Manager */}
            <div className="p-4 border-b border-app-border space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-app-muted">Estilos de Parágrafo</span>
                    <button onClick={onAddParagraphStyle} className="p-1 hover:bg-app-bg rounded text-app-accent" title="Criar Estilo">
                        <Plus size={14} />
                    </button>
                 </div>
                 <div className="space-y-1">
                     {state.project.paragraphStyles.map(pStyle => (
                         <div key={pStyle.id} className="group flex items-center justify-between p-2 rounded hover:bg-app-bg cursor-pointer">
                             <span 
                                className="text-sm truncate max-w-[150px]"
                                onClick={() => onApplyParagraphStyle?.(pStyle.id)}
                             >{pStyle.name}</span>
                             <button 
                                onClick={() => onRemoveParagraphStyle?.(pStyle.id)}
                                className="opacity-0 group-hover:opacity-100 text-app-muted hover:text-red-400"
                             >
                                 <Trash2 size={12} />
                             </button>
                         </div>
                     ))}
                     {state.project.paragraphStyles.length === 0 && (
                         <p className="text-[10px] text-app-muted italic">Nenhum estilo salvo.</p>
                     )}
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
                    style={{ fontFamily: primarySelection.style.fontFamily }}
                >
                    {FONT_OPTIONS.map((group) => (
                      <optgroup key={group.category} label={group.category} className="bg-app-panel text-app-muted">
                        {group.fonts.map((font) => (
                          <option key={font} value={font} style={{ fontFamily: font }} className="bg-app-bg text-app-text">
                            {font}
                          </option>
                        ))}
                      </optgroup>
                    ))}
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
                </div>
                
                {/* Advanced Color Picker with Swatches */}
                <div className="pt-2">
                     <label className="text-[10px] text-app-muted uppercase mb-2 flex items-center justify-between">
                        <span>Cor e Paleta</span>
                        <Palette size={10} />
                     </label>
                     
                     <div className="flex gap-2 mb-3">
                        <div className="w-10 h-10 rounded border border-app-border relative overflow-hidden shrink-0">
                            <input 
                                type="color" 
                                value={primarySelection.style.color || '#000000'}
                                onChange={(e) => onUpdateStyle({ color: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                            />
                        </div>
                        <div className="flex-1">
                             <div className="flex items-center gap-1">
                                <span className="text-app-muted text-xs">#</span>
                                <input 
                                    type="text" 
                                    value={(primarySelection.style.color || '').replace('#', '').toUpperCase()}
                                    onChange={(e) => {
                                        const val = '#' + e.target.value;
                                        if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
                                            onUpdateStyle({ color: val });
                                        }
                                    }}
                                    className="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-xs uppercase focus:border-app-accent focus:outline-none"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                             </div>
                             <button 
                                onClick={() => onAddSwatch && primarySelection.style.color && onAddSwatch(primarySelection.style.color)}
                                className="w-full mt-1.5 flex items-center justify-center gap-1 bg-app-bg border border-app-border rounded py-1 text-[10px] hover:bg-app-panel hover:text-white transition-colors"
                             >
                                 <Plus size={10} /> Salvar na Paleta
                             </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-6 gap-1.5">
                        {state.project.swatches?.map((color, idx) => (
                            <div 
                                key={`${color}-${idx}`} 
                                className="group relative w-6 h-6 rounded-sm cursor-pointer border border-transparent hover:border-white hover:scale-110 transition-all shadow-sm"
                                style={{ backgroundColor: color }}
                                onClick={() => onUpdateStyle({ color: color })}
                                title={color}
                            >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRemoveSwatch && onRemoveSwatch(color); }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={8} />
                                </button>
                            </div>
                        ))}
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
