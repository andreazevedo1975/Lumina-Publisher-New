
export enum Unit {
  PX = 'px',
  PT = 'pt',
  EM = 'em',
  REM = 'rem',
  PERCENT = '%',
  MM = 'mm'
}

export enum ElementType {
  TEXT_BLOCK = 'TEXT_BLOCK',
  IMAGE = 'IMAGE',
  SHAPE = 'SHAPE'
}

export interface BoxModel {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  unit: Unit;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  lineHeight: number; // Unitless multiplier or fixed
  letterSpacing: number; // Tracking
  wordSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  hyphenate: boolean;
  color: string;
  paddingLeft: number; // Indentation
}

export interface ParagraphStyle {
    id: string;
    name: string;
    style: Partial<TypographyStyle>;
}

export interface PageElement {
  id: string;
  type: ElementType;
  box: BoxModel;
  content: string; // HTML content for text, URL for image
  style: Partial<TypographyStyle>;
  zIndex: number;
  locked: boolean;
  altText?: string; // Accessibility
}

export interface Page {
  id: string;
  masterPageId?: string; // Inheritance
  pageNumber: number;
  elements: PageElement[];
  margins: { top: number; bottom: number; left: number; right: number };
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'font';
  size: string;
  dimensions?: string;
  usedCount: number;
}

export interface ProjectSettings {
  title: string;
  width: number;
  height: number;
  unit: Unit;
  bleed: number;
  exportFormat: 'epub' | 'pdf' | 'html';
}

export interface AppState {
  project: {
    settings: ProjectSettings;
    pages: Page[];
    assets: Asset[];
    paragraphStyles: ParagraphStyle[];
    swatches: string[]; // Paleta de cores global
  };
  ui: {
    zoom: number;
    activePageId: string;
    selectedElementIds: string[];
    editingElementId: string | null; // ID of the element currently being edited (text input mode)
    tool: 'select' | 'text' | 'image' | 'hand';
    viewMode: 'edit' | 'preview';
    leftPanelTab: 'pages' | 'assets' | 'structure';
  };
}
