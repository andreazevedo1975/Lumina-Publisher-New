
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle, X, Loader2, File, AlertTriangle, Settings as SettingsIcon, BookOpen, Edit3, Play } from 'lucide-react';
import { Asset, Page, ElementType } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (pages: Page[], assets: Asset[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  // --- Hooks must be at the top level ---
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Text Content State
  const [previewText, setPreviewText] = useState<string>("");
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload');

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false); // Moved to top
  
  // Options
  const [extractAssets, setExtractAssets] = useState(true);
  const [applyProStyles, setApplyProStyles] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setStep('upload');
        setFile(null);
        setPreviewText("");
        setProgress(0);
        setIsProcessing(false);
    }
  }, [isOpen]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
      setFile(selectedFile);
      setStep('preview');
      
      // Initial read/simulation
      if (selectedFile.type === "text/plain") {
          const text = await readFileContent(selectedFile);
          setPreviewText(text);
      } else {
          // For binary files in this demo env, we generate mock but allow user to paste real text
          const mock = generateMockContent(selectedFile.name);
          setPreviewText(mock);
      }
  };

  // Helper: Read text file content strictly
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  // Helper: Format raw text to simple HTML paragraphs preserving structure
  const formatTextToHTML = (text: string) => {
      if (!text) return '';
      
      // Preservação Estrita:
      // 1. Divide por parágrafos duplos (\n\n) -> <p>
      // 2. Preserva quebras de linha simples (\n) -> <br/> dentro do parágrafo
      
      return text
        .split(/\n\s*\n/) // Detecta blocos de parágrafos
        .map(para => {
             // Remove espaços extras nas pontas do parágrafo, mas mantém o conteúdo interno intacto
             const cleanPara = para; 
             if (!cleanPara.trim()) return '';
             
             // Converte quebras de linha simples em <br/> para preservar versos/listas
             const htmlContent = cleanPara.replace(/\n/g, '<br/>');
             
             return `<p>${htmlContent}</p>`;
        })
        .join('');
  };

  // Helper: Mock content for binary files (with clear warning)
  const generateMockContent = (filename: string): string => {
      // In a real app, this would use a server-side parser.
      // Here we provide a template for the user to paste their content if they want.
      return `[SIMULAÇÃO DE CONTEÚDO PARA ${filename}]\n\nDevido às restrições de segurança do navegador, a extração direta de arquivos DOCX/PDF requer um serviço de backend.\n\nPara diagramar seu conteúdo real, por favor:\n1. Abra seu arquivo original.\n2. Selecione todo o texto (Ctrl+A / Cmd+A).\n3. Copie e cole aqui substituindo este aviso.\n\nO restante desta simulação serve apenas para demonstrar a capacidade de paginação automática da ferramenta Lumina Publisher.\n\nCapítulo 1: O Início da Jornada\n\nO design editorial não é apenas sobre colocar palavras em uma página. É sobre dar voz ao silêncio entre as linhas. É a arquitetura invisível que sustenta a leitura.\n\nQuando olhamos para um livro bem diagramado, não vemos as margens, não notamos a entrelinha. Vemos apenas a história fluindo como um rio em direção ao mar. Mas para que esse fluxo exista, cada detalhe foi milimetricamente calculado. A tipografia escolhida, o peso da fonte, o kerning sutil entre um 'A' e um 'V'.\n\n(Cole seu texto aqui para testar a ferramenta com dados reais...)`;
  };

  // Helper: Simulate Asset Extraction
  const extractAssetsSimulated = (file: File): Asset[] => {
    const assets: Asset[] = [];
    if (!extractAssets) return assets;

    // Only simulate if user didn't provide a .txt (which has no assets usually, unless linked)
    if (file.type === "text/plain") return [];

    let count = 0;
    let namingPrefix = "img";
    let baseDimensions = [800, 600];

    if (file.name.toLowerCase().endsWith('.pdf')) {
        count = 5; namingPrefix = "fig_pdf";
    } else if (file.name.toLowerCase().endsWith('.epub')) {
        count = 8; namingPrefix = "img_epub";
    } else if (file.name.toLowerCase().endsWith('.docx')) {
        count = 3; namingPrefix = "img_word";
    }

    const timestamp = Date.now();

    for (let i = 0; i < count; i++) {
        const width = baseDimensions[0] + Math.floor(Math.random() * 200);
        const height = baseDimensions[1] + Math.floor(Math.random() * 200);
        assets.push({
            id: `imported-asset-${timestamp}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            name: `${namingPrefix}_${i + 1}.jpg`,
            url: `https://picsum.photos/${width}/${height}?random=${timestamp + i}`,
            type: 'image',
            size: '1.5MB',
            dimensions: `${width}x${height}`,
            usedCount: 0
        });
    }
    return assets;
  };

  const paginateText = (fullText: string, filename: string, availableAssets: Asset[]): Page[] => {
      const pages: Page[] = [];
      const charsPerPage = 2200; // Safe average for A4/Digital
      let currentIndex = 0;
      let pageNum = 0;
      let usedAssetCount = 0;
      
      const batchTimestamp = Date.now();

      let title = filename.split('.')[0];
      // Try to find title in first line
      const firstLineEnd = fullText.indexOf('\n');
      if (firstLineEnd > 0 && firstLineEnd < 100) {
          // If first line is short, treat as title
          title = fullText.substring(0, firstLineEnd).trim();
      }

      while (currentIndex < fullText.length) {
          pageNum++;
          let targetIndex = Math.min(currentIndex + charsPerPage, fullText.length);
          let endIndex = targetIndex;

          // INTELLIGENT CUTTING (Non-destructive)
          if (endIndex < fullText.length) {
              const remainingText = fullText.substring(currentIndex);
              
              // Find best break point relative to current position
              const searchWindow = remainingText.substring(0, charsPerPage + 200); // look a bit ahead/behind
              
              const lastParaBreak = searchWindow.lastIndexOf('\n\n', charsPerPage);
              const lastPeriod = searchWindow.lastIndexOf('.', charsPerPage);
              const lastSpace = searchWindow.lastIndexOf(' ', charsPerPage);

              if (lastParaBreak > charsPerPage * 0.6) {
                  endIndex = currentIndex + lastParaBreak;
              } else if (lastPeriod > charsPerPage * 0.7) {
                  endIndex = currentIndex + lastPeriod + 1;
              } else if (lastSpace > 0) {
                  endIndex = currentIndex + lastSpace;
              }
          }

          // Extract chunk WITHOUT trimming to preserve spaces between pages if any
          const rawChunk = fullText.substring(currentIndex, endIndex);
          let htmlContent = formatTextToHTML(rawChunk);

          const textStyle = applyProStyles ? { 
            fontFamily: 'Merriweather', 
            fontSize: 11, 
            lineHeight: 1.6, 
            textAlign: 'justify' as const, 
            hyphenate: true, 
            color: '#27272a',
            paddingLeft: 0,
            paddingRight: 0
          } : {
            fontFamily: 'Inter',
            fontSize: 12,
            lineHeight: 1.4,
            textAlign: 'left' as const,
            hyphenate: false,
            color: '#000000'
          };

          // Title Page handling (First page special styling if it looks like a title)
          if (pageNum === 1 && applyProStyles) {
             htmlContent = `<div style="margin-bottom: 3rem; text-align: center;"><h1 style="font-size: 24pt; font-weight: 700; color: #27272a;">${title}</h1><hr style="width: 50px; margin: 1rem auto; border-color: #e4e4e7;"/></div>` + htmlContent;
          }

          const elements = [
              {
                  id: `el-text-${batchTimestamp}-${pageNum}-${Math.random().toString(36).substr(2, 5)}`,
                  type: ElementType.TEXT_BLOCK,
                  box: { x: 50, y: 50, width: 495, height: 742, rotation: 0 },
                  content: htmlContent,
                  style: textStyle,
                  zIndex: 1, 
                  locked: false
              }
          ];

          // Auto-Insert Images
          if (extractAssets && pageNum > 1 && pageNum % 4 === 0 && usedAssetCount < availableAssets.length) {
              const asset = availableAssets[usedAssetCount];
              elements[0].box.height = 350; // Shrink text box
              elements.push({
                  id: `el-img-${batchTimestamp}-${pageNum}-${Math.random().toString(36).substr(2, 5)}`,
                  type: ElementType.IMAGE,
                  box: { x: 50, y: 420, width: 495, height: 350, rotation: 0 },
                  content: asset.url,
                  style: {},
                  zIndex: 2,
                  locked: false,
                  altText: `Imagem importada ${usedAssetCount + 1}`
              } as any);
              usedAssetCount++;
          }

          pages.push({
              id: `imported-page-${batchTimestamp}-${pageNum}-${Math.random().toString(36).substr(2, 5)}`,
              pageNumber: pageNum,
              margins: { top: 50, bottom: 50, left: 50, right: 50 },
              elements: elements as any
          });

          currentIndex = endIndex;
          if (fullText[currentIndex] === '\n') currentIndex++; 
          if (fullText[currentIndex] === '\n') currentIndex++; 
      }
      return pages;
  };

  const handleClose = () => {
      onClose();
      // Reset state after transition
      setTimeout(() => {
          setStep('upload');
          setFile(null);
          setPreviewText("");
          setIsProcessing(false);
      }, 300);
  };

  const startProcessing = async () => {
    if (!previewText) return;
    setStep('processing');
    setIsProcessing(true);
    setProgress(0);
    setStatus('Iniciando motor de diagramação...');

    try {
        await new Promise(r => setTimeout(r, 500));
        
        // Asset Extraction
        let extractedAssets: Asset[] = [];
        if (extractAssets && file) {
            setStatus('Processando ativos de mídia...');
            setProgress(30);
            await new Promise(r => setTimeout(r, 600));
            extractedAssets = extractAssetsSimulated(file);
        }

        setStatus('Calculando quebras de página e fluxo de texto...');
        setProgress(60);
        await new Promise(r => setTimeout(r, 800));

        // Use the text from the preview textarea (which user might have edited)
        const pages = paginateText(previewText, file?.name || 'Sem Título', extractedAssets);

        setStatus(`Finalizando: ${pages.length} páginas geradas.`);
        setProgress(100);
        await new Promise(r => setTimeout(r, 500));

        onImportComplete(pages, extractedAssets);
        handleClose();

    } catch (e) {
        console.error(e);
        setStatus("Erro no processamento.");
        setStep('preview'); // Go back on error
        setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-[800px] h-[600px] bg-app-panel border border-app-border rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-app-border flex justify-between items-center bg-app-bg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-app-accent/10 rounded-md">
                 <UploadCloud className="text-app-accent" size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white">Importar Manuscrito</h2>
                <p className="text-xs text-app-muted">DOCX, PDF, EPUB, TXT • Preservação Integral de Texto</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-app-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
            
            {/* STEP 1: UPLOAD */}
            {step === 'upload' && (
                <div className="flex-1 p-8 flex flex-col items-center justify-center">
                    <label 
                        className={`w-full max-w-lg h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group
                        ${dragActive ? 'border-app-accent bg-app-accent/5' : 'border-app-border hover:border-app-muted hover:bg-app-bg'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input 
                            ref={inputRef}
                            type="file" 
                            className="hidden" 
                            accept=".docx,.pdf,.epub,.txt"
                            onChange={handleChange}
                        />
                        <div className="w-20 h-20 bg-app-bg rounded-full flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform">
                            <BookOpen size={40} className="text-app-muted group-hover:text-app-text" />
                        </div>
                        <h3 className="text-lg font-medium text-app-text mb-2">Selecione ou Arraste o Arquivo</h3>
                        <p className="text-sm text-app-muted px-8">
                            Suportamos formatos de texto e ebooks. O conteúdo será extraído para validação antes da diagramação.
                        </p>
                    </label>
                </div>
            )}

            {/* STEP 2: PREVIEW & EDIT */}
            {step === 'preview' && (
                <div className="flex-1 flex flex-col h-full">
                    <div className="bg-app-bg/50 px-6 py-2 border-b border-app-border flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <FileText size={14} className="text-app-muted"/>
                            <span className="text-xs font-bold text-app-muted uppercase">Pré-visualização do Conteúdo ({file?.name})</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <AlertTriangle size={14} className="text-yellow-500" />
                             <span className="text-[10px] text-yellow-500">Revise o texto abaixo. Isso é o que será diagramado.</span>
                         </div>
                    </div>
                    
                    <div className="flex-1 p-0 relative">
                        <textarea 
                            className="w-full h-full bg-[#1e1e20] text-app-text p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                            value={previewText}
                            onChange={(e) => setPreviewText(e.target.value)}
                            spellCheck={false}
                        />
                        {/* Overlay warning for binaries if simulated */}
                        {file && file.type !== "text/plain" && previewText.includes("SIMULAÇÃO DE CONTEÚDO") && (
                            <div className="absolute top-4 right-4 max-w-xs bg-blue-900/90 border border-blue-500/30 p-3 rounded shadow-xl backdrop-blur-md pointer-events-none">
                                <p className="text-xs text-blue-100 mb-1 font-bold">Modo de Simulação</p>
                                <p className="text-[10px] text-blue-200">
                                    Para arquivos binários nesta demo, geramos este texto. 
                                    <span className="text-white font-bold"> Você pode apagar tudo e colar seu texto real</span> para ver a diagramação funcionar com seus dados.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-3 bg-app-bg border-t border-app-border flex items-center gap-6">
                         <label className="flex items-center gap-2 text-xs text-app-text cursor-pointer hover:text-white">
                            <input 
                                type="checkbox" 
                                checked={extractAssets}
                                onChange={(e) => setExtractAssets(e.target.checked)}
                                className="accent-app-accent" 
                            />
                            Simular Extração de Imagens
                        </label>
                        <label className="flex items-center gap-2 text-xs text-app-text cursor-pointer hover:text-white">
                            <input 
                                type="checkbox" 
                                checked={applyProStyles}
                                onChange={(e) => setApplyProStyles(e.target.checked)}
                                className="accent-app-accent" 
                            />
                            Aplicar Estilos Profissionais
                        </label>
                    </div>
                </div>
            )}

            {/* STEP 3: PROCESSING */}
            {step === 'processing' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                     <div className="relative w-24 h-24 flex items-center justify-center">
                        <Loader2 size={48} className="text-app-accent animate-spin" />
                        <span className="absolute text-xs font-bold text-white">{progress}%</span>
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-lg font-medium text-white">{status}</h3>
                        <p className="text-sm text-app-muted">Estamos aplicando as regras de diagramação sem alterar seu texto.</p>
                     </div>
                     <div className="w-64 h-1.5 bg-app-bg rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-app-accent transition-all duration-300" style={{ width: `${progress}%` }}></div>
                     </div>
                </div>
            )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-app-bg border-t border-app-border flex justify-between items-center">
            {step === 'preview' ? (
                <>
                    <button 
                        onClick={() => { setStep('upload'); setFile(null); }}
                        className="text-sm text-app-muted hover:text-white transition-colors"
                    >
                        Voltar / Trocar Arquivo
                    </button>
                    <button 
                        onClick={startProcessing}
                        className="flex items-center gap-2 px-6 py-2 bg-app-accent hover:bg-sky-600 text-white text-sm font-medium rounded transition-all shadow-lg shadow-sky-900/20"
                    >
                        <Play size={16} fill="currentColor" />
                        Gerar Diagramação
                    </button>
                </>
            ) : step === 'upload' ? (
                <button 
                    onClick={onClose} 
                    className="text-sm text-app-muted hover:text-white transition-colors ml-auto"
                >
                    Cancelar
                </button>
            ) : (
                <div className="ml-auto"></div> // Placeholder for processing state
            )}
        </div>

      </div>
    </div>
  );
};
