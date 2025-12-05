
import React, { useState, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { PropertyPanel } from './components/PropertyPanel';
import { Canvas } from './components/Canvas';
import { ImportModal } from './components/ImportModal';
import { AppState, Unit, ElementType, Page, Asset, TypographyStyle, ParagraphStyle } from './types';
import { analyzeManuscript } from './services/geminiService';

const INITIAL_PAGE_WIDTH = 595; // A4 approx width in pt
const INITIAL_PAGE_HEIGHT = 842; // A4 approx height in pt

const DEFAULT_TEXT = `
  <p>O design é a alma de qualquer publicação digital. Não é apenas como se vê, mas como funciona. A tipografia cria o ritmo da leitura, guiando os olhos através da narrativa.</p>
  <p>Na era digital, o diagrama deve ser fluido. O texto se adapta, as imagens respondem, mas a beleza da composição clássica permanece. As grades invisíveis sustentam a ordem no caos dos pixels.</p>
`;

const App: React.FC = () => {
  // Application State
  const [state, setState] = useState<AppState>({
    project: {
      settings: {
        title: "Projeto Sem Título",
        width: INITIAL_PAGE_WIDTH,
        height: INITIAL_PAGE_HEIGHT,
        unit: Unit.PT,
        bleed: 3,
        exportFormat: 'epub'
      },
      assets: [
         { id: '1', name: 'capa.jpg', type: 'image', url: 'https://picsum.photos/400/600', size: '1.2MB', dimensions: '1200x1800', usedCount: 1 },
         { id: '2', name: 'grafico.png', type: 'image', url: 'https://picsum.photos/300/300', size: '450KB', dimensions: '800x800', usedCount: 0 }
      ],
      paragraphStyles: [
        {
            id: 'style-body',
            name: 'Corpo de Texto',
            style: { fontFamily: 'Merriweather', fontSize: 11, lineHeight: 1.5, textAlign: 'justify', color: '#27272a' }
        },
        {
            id: 'style-h1',
            name: 'Título H1',
            style: { fontFamily: 'Merriweather', fontSize: 24, fontWeight: 700, lineHeight: 1.2, textAlign: 'left', color: '#0ea5e9' }
        },
        {
            id: 'style-quote',
            name: 'Citação',
            style: { fontFamily: 'Merriweather', fontSize: 12, fontStyle: 'italic', color: '#52525b', paddingLeft: 20 }
        }
      ],
      swatches: [
        '#000000', '#FFFFFF', '#27272A', '#52525B', // Grayscale
        '#0EA5E9', '#EF4444', '#10B981', '#F59E0B', // Standard Accents
        '#F4F4F5', '#18181B' // Backgrounds
      ],
      pages: [
        {
          id: 'page-1',
          pageNumber: 1,
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          elements: [
             {
                 id: 'el-1',
                 type: ElementType.TEXT_BLOCK,
                 box: { x: 50, y: 100, width: 495, height: 200, rotation: 0 },
                 content: '<h1 style="font-weight:700; margin-bottom: 1em;">Capítulo Um: O Grid</h1>' + DEFAULT_TEXT,
                 style: {
                     fontFamily: 'Merriweather',
                     fontSize: 12,
                     lineHeight: 1.5,
                     textAlign: 'justify',
                     hyphenate: true,
                     color: '#000000'
                 },
                 zIndex: 1,
                 locked: false
             },
             {
                 id: 'el-2',
                 type: ElementType.IMAGE,
                 box: { x: 50, y: 350, width: 200, height: 300, rotation: 0 },
                 content: 'https://picsum.photos/400/600',
                 style: {},
                 zIndex: 1,
                 locked: false,
                 altText: 'Arte abstrata de capa com gradientes'
             },
             {
                 id: 'el-3',
                 type: ElementType.TEXT_BLOCK,
                 box: { x: 270, y: 350, width: 275, height: 300, rotation: 0 },
                 content: DEFAULT_TEXT,
                 style: {
                     fontFamily: 'Merriweather',
                     fontSize: 12,
                     lineHeight: 1.5,
                     textAlign: 'justify',
                     hyphenate: true,
                     color: '#000000'
                 },
                 zIndex: 1,
                 locked: false
             }
          ]
        }
      ]
    },
    ui: {
      zoom: 1,
      activePageId: 'page-1',
      selectedElementIds: ['el-1'],
      editingElementId: null,
      tool: 'select',
      viewMode: 'edit',
      leftPanelTab: 'pages'
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Actions
  const handlePageSelect = (id: string) => {
      setState(prev => ({ 
          ...prev, 
          ui: { 
              ...prev.ui, 
              activePageId: id, 
              selectedElementIds: [],
              editingElementId: null 
          } 
      }));
  };

  const handleElementSelect = (id: string) => {
      setState(prev => ({ 
          ...prev, 
          ui: { 
              ...prev.ui, 
              selectedElementIds: [id],
              // Don't clear editingElementId here if clicking inside the same element
              editingElementId: prev.ui.editingElementId === id ? id : null 
          } 
      }));
  };

  const handleSetEditing = (id: string | null) => {
      setState(prev => ({
          ...prev,
          ui: { ...prev.ui, editingElementId: id }
      }));
  };

  const handleContentUpdate = (id: string, newContent: string) => {
      setState(prev => {
          const activePageIndex = prev.project.pages.findIndex(p => p.id === prev.ui.activePageId);
          if (activePageIndex === -1) return prev;

          const activePage = prev.project.pages[activePageIndex];
          const updatedElements = activePage.elements.map(el => {
              if (el.id === id) {
                  return { ...el, content: newContent };
              }
              return el;
          });

          const updatedPages = [...prev.project.pages];
          updatedPages[activePageIndex] = { ...activePage, elements: updatedElements };

          return {
              ...prev,
              project: { ...prev.project, pages: updatedPages }
          };
      });
  };

  const handleStyleUpdate = (newStyle: Partial<TypographyStyle>) => {
      setState(prev => {
          const activePageIndex = prev.project.pages.findIndex(p => p.id === prev.ui.activePageId);
          if (activePageIndex === -1) return prev;

          const activePage = prev.project.pages[activePageIndex];
          const updatedElements = activePage.elements.map(el => {
              if (prev.ui.selectedElementIds.includes(el.id) && el.type === ElementType.TEXT_BLOCK) {
                  return {
                      ...el,
                      style: { ...el.style, ...newStyle }
                  };
              }
              return el;
          });

          const updatedPages = [...prev.project.pages];
          updatedPages[activePageIndex] = { ...activePage, elements: updatedElements };

          return {
              ...prev,
              project: { ...prev.project, pages: updatedPages }
          };
      });
  };

  const handleAddParagraphStyle = () => {
      const activeElementId = state.ui.selectedElementIds[0];
      const page = state.project.pages.find(p => p.id === state.ui.activePageId);
      const element = page?.elements.find(e => e.id === activeElementId);

      if (element && element.type === ElementType.TEXT_BLOCK) {
          const name = prompt("Nome do novo Estilo de Parágrafo:", "Novo Estilo");
          if (name) {
              const newStyle: ParagraphStyle = {
                  id: `style-${Date.now()}`,
                  name,
                  style: { ...element.style } // Copy current style
              };
              setState(prev => ({
                  ...prev,
                  project: {
                      ...prev.project,
                      paragraphStyles: [...prev.project.paragraphStyles, newStyle]
                  }
              }));
          }
      } else {
          alert("Selecione um texto para criar um estilo baseado nele.");
      }
  };

  const handleApplyParagraphStyle = (styleId: string) => {
      const styleToApply = state.project.paragraphStyles.find(s => s.id === styleId);
      if (styleToApply) {
          handleStyleUpdate(styleToApply.style);
      }
  };

  const handleRemoveParagraphStyle = (styleId: string) => {
      if (confirm("Remover este estilo?")) {
          setState(prev => ({
              ...prev,
              project: {
                  ...prev.project,
                  paragraphStyles: prev.project.paragraphStyles.filter(s => s.id !== styleId)
              }
          }));
      }
  };

  // --- Swatch Management ---
  const handleAddSwatch = (color: string) => {
      if (!state.project.swatches.includes(color)) {
          setState(prev => ({
              ...prev,
              project: { ...prev.project, swatches: [...prev.project.swatches, color] }
          }));
      }
  };

  const handleRemoveSwatch = (color: string) => {
      setState(prev => ({
          ...prev,
          project: { ...prev.project, swatches: prev.project.swatches.filter(c => c !== color) }
      }));
  };

  const handleAddPage = () => {
      const newPage: Page = {
          id: `page-${Date.now()}`,
          pageNumber: state.project.pages.length + 1,
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          elements: []
      };
      setState(prev => ({
          ...prev,
          project: { ...prev.project, pages: [...prev.project.pages, newPage] },
          ui: { ...prev.ui, activePageId: newPage.id }
      }));
  };

  const handleImportComplete = (importedPages: Page[], importedAssets: Asset[]) => {
     setState(prev => {
        // Recalculate page numbers
        const currentPages = [...prev.project.pages];
        const startingPageNum = currentPages.length + 1;
        
        const adjustedImportedPages = importedPages.map((p, idx) => ({
            ...p,
            pageNumber: startingPageNum + idx
        }));

        // Concatenate pages and assets
        const finalPages = [...currentPages, ...adjustedImportedPages];
        const finalAssets = [...prev.project.assets, ...importedAssets];

        return {
            ...prev,
            project: {
                ...prev.project,
                pages: finalPages,
                assets: finalAssets
            },
            ui: {
                ...prev.ui,
                activePageId: adjustedImportedPages[0]?.id || prev.ui.activePageId,
                leftPanelTab: 'pages' // Optionally switch to assets if preferred, but usually user wants to see pages
            }
        };
     });
  };

  const handleAutoDiagram = async () => {
      if (!process.env.API_KEY) {
          alert("Por favor, configure a variável de ambiente REACT_APP_GEMINI_API_KEY para usar recursos de IA.");
          return;
      }
      
      setIsProcessing(true);
      const rawText = "Capítulo 2: A Fronteira Digital. Na vasta extensão do reino digital, os motores de layout rugiram com vida. Esta é uma história sobre pixels e vetores colidindo em harmonia perfeita.";
      
      const analysis = await analyzeManuscript(rawText);
      
      if (analysis) {
          // Create a new page with the analyzed content
          const newPageId = `page-${Date.now()}`;
          const newElements = [
              {
                id: `el-title-${Date.now()}`,
                type: ElementType.TEXT_BLOCK,
                box: { x: 50, y: 50, width: 495, height: 60, rotation: 0 },
                content: `<h1 style="color:${analysis.suggestedStyles.primaryColor}; font-family:${analysis.suggestedStyles.headerFont}">${analysis.title || "Novo Capítulo"}</h1>`,
                style: { fontFamily: analysis.suggestedStyles.headerFont, fontSize: 24, textAlign: 'left', color: analysis.suggestedStyles.primaryColor },
                zIndex: 1, locked: false
              },
              {
                id: `el-body-${Date.now()}`,
                type: ElementType.TEXT_BLOCK,
                box: { x: 50, y: 130, width: 495, height: 600, rotation: 0 },
                content: analysis.semanticHTML,
                style: { fontFamily: analysis.suggestedStyles.bodyFont, fontSize: 11, lineHeight: 1.6, textAlign: 'justify', hyphenate: true },
                zIndex: 1, locked: false
              }
          ] as any; // Quick casting for demo

          setState(prev => ({
              ...prev,
              project: {
                  ...prev.project,
                  pages: [...prev.project.pages, {
                      id: newPageId,
                      pageNumber: prev.project.pages.length + 1,
                      margins: { top: 50, bottom: 50, left: 50, right: 50 },
                      elements: newElements
                  }]
              },
              ui: { ...prev.ui, activePageId: newPageId, selectedElementIds: [newElements[0].id] }
          }));
      }

      setIsProcessing(false);
  };

  const handleExport = () => {
      // Mock Export
      const blob = new Blob([JSON.stringify(state.project, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lumina-projeto.json';
      a.click();
  };

  return (
    <div className="flex flex-col h-screen bg-app-bg text-app-text font-sans overflow-hidden">
      <Toolbar 
        uiState={state.ui} 
        setUiState={(val) => setState(prev => ({...prev, ui: typeof val === 'function' ? val(prev.ui) : val}))}
        onExport={handleExport}
        onAnalyze={handleAutoDiagram}
        onImportClick={() => setIsImportModalOpen(true)}
        isProcessing={isProcessing}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
            state={state} 
            onPageSelect={handlePageSelect} 
            onTabChange={(tab) => setState(prev => ({...prev, ui: {...prev.ui, leftPanelTab: tab}}))}
            onAddPage={handleAddPage}
        />
        <Canvas 
            state={state} 
            onSelectElement={handleElementSelect} 
            onContentUpdate={handleContentUpdate}
            onSetEditing={handleSetEditing}
        />
        <PropertyPanel 
            state={state} 
            onUpdateStyle={handleStyleUpdate}
            onApplyParagraphStyle={handleApplyParagraphStyle}
            onAddParagraphStyle={handleAddParagraphStyle}
            onRemoveParagraphStyle={handleRemoveParagraphStyle}
            onAddSwatch={handleAddSwatch}
            onRemoveSwatch={handleRemoveSwatch}
        />
      </div>

      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default App;
