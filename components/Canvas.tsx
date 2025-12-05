
import React, { useRef, useEffect, useState } from 'react';
import { UploadCloud, Link as LinkIcon, Check, X } from 'lucide-react';
import { AppState, ElementType, Page, PageElement } from '../types';

interface CanvasProps {
  state: AppState;
  onSelectElement: (id: string) => void;
  onContentUpdate: (id: string, content: string) => void;
  onSetEditing: (id: string | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ state, onSelectElement, onContentUpdate, onSetEditing }) => {
  const { project, ui } = state;
  const activePage = project.pages.find(p => p.id === ui.activePageId);

  // Calculate scaling based on zoom
  const scale = ui.zoom;

  // Clear editing when clicking on empty canvas
  const handleCanvasClick = () => {
      if (ui.editingElementId) {
          onSetEditing(null);
      }
      // Also clear selection if needed, but keeping selection is often better UX
  };

  if (!activePage) return <div className="flex-1 bg-app-bg flex items-center justify-center text-app-muted">Nenhuma página selecionada</div>;

  return (
    <div 
        className="flex-1 bg-neutral-900 overflow-auto flex justify-center p-12 relative"
        onClick={handleCanvasClick}
    >
      {/* The Page Board */}
      <div 
        className="bg-white shadow-2xl relative transition-transform duration-200 ease-out"
        style={{
          width: `${project.settings.width * scale}px`,
          height: `${project.settings.height * scale}px`,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent canvas click from clearing selection if clicking page
      >
        {/* Margins Guide */}
        <div 
           className="absolute border border-cyan-300 border-dashed pointer-events-none opacity-50"
           style={{
               top: `${activePage.margins.top * scale}px`,
               bottom: `${activePage.margins.bottom * scale}px`,
               left: `${activePage.margins.left * scale}px`,
               right: `${activePage.margins.right * scale}px`,
           }}
        />

        {/* Elements Rendering */}
        {activePage.elements.map(element => (
           <ElementRenderer 
             key={element.id} 
             element={element} 
             scale={scale} 
             isSelected={ui.selectedElementIds.includes(element.id)}
             isEditing={ui.editingElementId === element.id}
             onSelect={() => onSelectElement(element.id)}
             onUpdateContent={(content) => onContentUpdate(element.id, content)}
             onStartEditing={() => onSetEditing(element.id)}
             onStopEditing={() => onSetEditing(null)}
           />
        ))}

      </div>
      
      {/* Floating Info */}
      <div className="absolute bottom-6 left-6 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-mono backdrop-blur-sm pointer-events-none">
        Página {activePage.pageNumber} • {project.settings.width}x{project.settings.height}px
      </div>
    </div>
  );
};

const ElementRenderer: React.FC<{
    element: PageElement, 
    scale: number, 
    isSelected: boolean,
    isEditing: boolean,
    onSelect: () => void,
    onUpdateContent: (content: string) => void,
    onStartEditing: () => void,
    onStopEditing: () => void
}> = ({ element, scale, isSelected, isEditing, onSelect, onUpdateContent, onStartEditing, onStopEditing }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [tempUrl, setTempUrl] = useState('');

    useEffect(() => {
        // Handle TEXT editing start
        if (isEditing && contentRef.current && element.type === ElementType.TEXT_BLOCK) {
            // Manually populate content when starting edit to avoid React syncing issues with contentEditable
            if (contentRef.current.innerHTML !== element.content) {
                 contentRef.current.innerHTML = element.content;
            }
            contentRef.current.focus();
        }
        
        // Handle IMAGE editing start
        if (isEditing && element.type === ElementType.IMAGE) {
            setTempUrl(element.content);
        }
    }, [isEditing, element.type, element.content]);

    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${element.box.x * scale}px`,
        top: `${element.box.y * scale}px`,
        width: `${element.box.width * scale}px`,
        height: `${element.box.height * scale}px`,
        transform: `rotate(${element.box.rotation}deg)`,
        // Edit mode gets a distinct dashed border, Selection gets solid blue
        border: isEditing ? '2px dashed #10b981' : isSelected ? '2px solid #0ea5e9' : '1px solid transparent',
        cursor: isEditing ? 'text' : 'move',
        zIndex: isEditing ? 100 : element.zIndex
    };

    const handleStyle: React.CSSProperties = {
        width: '8px',
        height: '8px',
        backgroundColor: 'white',
        border: '1px solid #0ea5e9',
        position: 'absolute',
        borderRadius: '50%',
        zIndex: 50
    }

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect();
        onStartEditing();
    };

    if (element.type === ElementType.TEXT_BLOCK) {
        return (
            <div 
                style={style} 
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                onDoubleClick={handleDoubleClick}
                className="group hover:border-cyan-300/30"
            >
                <div 
                    ref={contentRef}
                    className={`w-full h-full overflow-hidden outline-none ${isEditing ? 'cursor-text select-text' : 'select-none'}`}
                    style={{
                        fontFamily: element.style.fontFamily,
                        fontSize: `${(element.style.fontSize || 12) * scale}px`,
                        lineHeight: element.style.lineHeight,
                        color: element.style.color,
                        textAlign: element.style.textAlign,
                        fontStyle: element.style.fontStyle || 'normal',
                        fontWeight: element.style.fontWeight || 400,
                        letterSpacing: `${(element.style.letterSpacing || 0) * scale}px`,
                        // Padding acts as internal margins/inset
                        paddingTop: `${4 * scale}px`,
                        paddingRight: `${4 * scale}px`,
                        paddingBottom: `${4 * scale}px`,
                        paddingLeft: `${(element.style.paddingLeft || 4) * scale}px`,
                        hyphens: element.style.hyphenate ? 'auto' : 'none',
                    }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onKeyDown={(e) => {
                        // Stop propagation so delete/backspace doesn't delete the element itself in the App
                        e.stopPropagation();
                    }}
                    onBlur={(e) => {
                        onUpdateContent(e.currentTarget.innerHTML);
                        onStopEditing();
                    }}
                    // If we are NOT editing, we rely on dangerouslySetInnerHTML to render standard HTML.
                    // If we ARE editing, we leave it undefined so we can manage it manually via Ref/ContentEditable
                    dangerouslySetInnerHTML={!isEditing ? { __html: element.content } : undefined}
                />
                
                {isSelected && !isEditing && (
                    <>
                        <div style={{ ...handleStyle, top: -4, left: -4 }} />
                        <div style={{ ...handleStyle, top: -4, right: -4 }} />
                        <div style={{ ...handleStyle, bottom: -4, left: -4 }} />
                        <div style={{ ...handleStyle, bottom: -4, right: -4 }} />
                    </>
                )}
            </div>
        )
    }

    if (element.type === ElementType.IMAGE) {
        return (
             <div 
                style={style} 
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                onDoubleClick={handleDoubleClick}
                className="group bg-gray-100 relative"
            >
                <img 
                    src={element.content} 
                    alt={element.altText}
                    className="w-full h-full object-cover pointer-events-none" 
                />
                
                 {isSelected && !isEditing && (
                    <>
                        <div style={{ ...handleStyle, top: -4, left: -4 }} />
                        <div style={{ ...handleStyle, top: -4, right: -4 }} />
                        <div style={{ ...handleStyle, bottom: -4, left: -4 }} />
                        <div style={{ ...handleStyle, bottom: -4, right: -4 }} />
                    </>
                )}

                {isEditing && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-app-panel border border-app-border rounded-lg shadow-xl p-3 w-72 z-[9999] animate-in slide-in-from-top-2">
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="text-xs text-white font-bold uppercase">Editar Imagem</h4>
                             <button onClick={(e) => { e.stopPropagation(); onStopEditing(); }} className="text-app-muted hover:text-white"><X size={14} /></button>
                         </div>
                        
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Cole uma URL..." 
                                        className="w-full bg-app-bg border border-app-border rounded px-2 py-1.5 text-xs text-white focus:border-app-accent focus:outline-none pr-6"
                                        value={tempUrl}
                                        onChange={(e) => setTempUrl(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <LinkIcon size={10} className="absolute right-2 top-2 text-app-muted" />
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); if(tempUrl) { onUpdateContent(tempUrl); onStopEditing(); } }}
                                    className="px-2 bg-app-accent rounded text-white hover:bg-sky-600 flex items-center justify-center"
                                    title="Aplicar URL"
                                >
                                    <Check size={14} />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="h-px bg-app-border flex-1"></div>
                                <span className="text-[10px] text-app-muted uppercase">ou</span>
                                <div className="h-px bg-app-border flex-1"></div>
                            </div>

                            <label className="flex items-center justify-center gap-2 w-full py-2 bg-app-bg border border-dashed border-app-border rounded cursor-pointer hover:border-app-accent hover:text-app-accent hover:bg-app-accent/5 transition-all group/upload">
                                <UploadCloud size={14} className="text-app-muted group-hover/upload:text-app-accent" />
                                <span className="text-xs font-medium">Upload Local</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            const url = URL.createObjectURL(e.target.files[0]);
                                            onUpdateContent(url);
                                            onStopEditing();
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return null;
}
