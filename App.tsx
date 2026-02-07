import React, { useState, useCallback } from 'react';
import { BlockData, BlockType } from './types';
import { BlockEditor } from './components/BlockEditor';
import { 
  Type, Image as ImageIcon, Code, Quote, List, ListOrdered, 
  Minus, FileDown, Eye, PenLine, Plus, Layout, Github, FileCode
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const INITIAL_BLOCKS: BlockData[] = [
  { id: '1', type: 'h1', content: 'Welcome to MarkFlow' },
  { id: '2', type: 'paragraph', content: 'This is a low-code Markdown editor designed with the Gemini aesthetics. Drag blocks and export seamlessly.' },
];

function App() {
  const [blocks, setBlocks] = useState<BlockData[]>(INITIAL_BLOCKS);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'code'>('edit');

  // --- Block Management ---

  const addBlock = (type: BlockType) => {
    const newBlock: BlockData = {
      id: crypto.randomUUID(),
      type,
      content: '',
      metadata: type.includes('list') ? { items: [''] } : {}
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = useCallback((id: string, updates: Partial<BlockData>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newBlocks = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
      return newBlocks;
    });
  }, []);

  // --- Output Generation ---

  const generateMarkdownString = (currentBlocks: BlockData[]): string => {
    return currentBlocks.map(block => {
      switch (block.type) {
        case 'h1': return `# ${block.content}`;
        case 'h2': return `## ${block.content}`;
        case 'h3': return `### ${block.content}`;
        case 'paragraph': return `${block.content}`;
        case 'blockquote': return `> ${block.content}`;
        case 'code': return `\`\`\`${block.metadata?.language || ''}\n${block.content}\n\`\`\``;
        case 'image': return `![${block.metadata?.alt || 'image'}](${block.content})`;
        case 'list-ul': return (block.metadata?.items || []).map(item => `- ${item}`).join('\n');
        case 'list-ol': return (block.metadata?.items || []).map((item, i) => `${i + 1}. ${item}`).join('\n');
        case 'divider': return `---`;
        default: return '';
      }
    }).join('\n\n');
  };

  const handleDownload = () => {
    const md = generateMarkdownString(blocks);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- UI Components ---

  const SidebarButton = ({ type, icon: Icon, label }: { type: BlockType, icon: any, label: string }) => (
    <button 
      onClick={() => addBlock(type)}
      className="group flex items-center gap-3 w-full px-3 py-2 rounded-md text-studio-dim hover:text-studio-text hover:bg-studio-hover transition-all text-sm font-medium"
    >
      <Icon size={16} className="text-studio-dim group-hover:text-studio-primary transition-colors" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-studio-bg text-studio-text overflow-hidden font-sans selection:bg-studio-primary/30">
      
      {/* Sidebar - Google AI Studio style panel */}
      <aside className="w-64 flex flex-col border-r border-studio-border bg-studio-panel hidden md:flex">
        <div className="p-5 h-16 flex items-center border-b border-studio-border">
          <div className="flex items-center gap-2">
             <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-1.5 rounded-lg">
                <Layout className="w-4 h-4 text-white" />
             </div>
             <h1 className="text-lg font-semibold tracking-tight text-white">MarkFlow</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold text-studio-dim uppercase tracking-widest mb-2 opacity-70">Structure</p>
            <SidebarButton type="h1" icon={Type} label="Heading 1" />
            <SidebarButton type="h2" icon={Type} label="Heading 2" />
            <SidebarButton type="h3" icon={Type} label="Heading 3" />
            <SidebarButton type="paragraph" icon={Type} label="Paragraph" />
          </div>
          
          <div>
             <p className="px-3 text-[11px] font-bold text-studio-dim uppercase tracking-widest mb-2 opacity-70">Media & Code</p>
            <SidebarButton type="image" icon={ImageIcon} label="Image" />
            <SidebarButton type="code" icon={Code} label="Code Block" />
            <SidebarButton type="blockquote" icon={Quote} label="Blockquote" />
          </div>
          
          <div>
            <p className="px-3 text-[11px] font-bold text-studio-dim uppercase tracking-widest mb-2 opacity-70">Lists</p>
            <SidebarButton type="list-ul" icon={List} label="Bullet List" />
            <SidebarButton type="list-ol" icon={ListOrdered} label="Numbered List" />
            <SidebarButton type="divider" icon={Minus} label="Divider" />
          </div>
        </div>

        <div className="p-4 border-t border-studio-border">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-studio-dim hover:text-white transition-colors">
            <Github size={14} /> 
            <span>View Source</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-studio-bg">
        
        {/* Header / Toolbar */}
        <header className="h-16 border-b border-studio-border flex items-center justify-between px-6 bg-studio-bg sticky top-0 z-20">
           <div className="md:hidden flex items-center gap-2">
             <Layout className="w-5 h-5 text-studio-primary" />
             <span className="font-bold text-white">MarkFlow</span>
           </div>
           
           <div className="flex-1" /> {/* Spacer */}

           <div className="flex items-center gap-4">
              {/* View Mode Switcher - Segmented Control Style */}
              <div className="flex bg-studio-panel border border-studio-border p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all ${viewMode === 'edit' ? 'bg-studio-hover text-white shadow-sm' : 'text-studio-dim hover:text-white'}`}
                >
                  <PenLine size={14} />
                  Edit
                </button>
                <button 
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all ${viewMode === 'preview' ? 'bg-studio-hover text-white shadow-sm' : 'text-studio-dim hover:text-white'}`}
                >
                  <Eye size={14} />
                  Preview
                </button>
                <button 
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all ${viewMode === 'code' ? 'bg-studio-hover text-white shadow-sm' : 'text-studio-dim hover:text-white'}`}
                >
                  <FileCode size={14} />
                  Code
                </button>
              </div>

              <div className="h-6 w-px bg-studio-border"></div>

              <button 
                onClick={handleDownload}
                className="text-studio-dim hover:text-white hover:bg-studio-hover p-2 rounded-full transition-colors"
                title="Export Markdown"
              >
                <FileDown size={20} />
              </button>
           </div>
        </header>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto bg-studio-bg scroll-smooth">
          <div className="max-w-5xl mx-auto py-8 px-4 md:px-12">
            
            {viewMode === 'edit' && (
              <div className="space-y-6">
                {blocks.length === 0 && (
                   <div className="text-center py-20 border border-dashed border-studio-border rounded-xl bg-studio-panel/50">
                      <p className="text-studio-dim">No content yet.</p>
                      <p className="text-sm text-studio-dim/70 mt-2">Use the sidebar to add blocks.</p>
                   </div>
                )}
                {blocks.map((block, index) => (
                  <BlockEditor 
                    key={block.id}
                    block={block}
                    updateBlock={updateBlock}
                    removeBlock={removeBlock}
                    moveBlock={moveBlock}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                  />
                ))}

                {/* Quick Add at bottom */}
                <div className="pt-8 flex justify-center pb-20">
                   <div className="flex gap-3 group">
                      <button onClick={() => addBlock('paragraph')} className="flex items-center gap-2 px-4 py-2 bg-studio-panel border border-studio-border rounded-full hover:bg-studio-hover text-studio-dim hover:text-white transition-all text-sm font-medium shadow-sm">
                        <Plus size={16} /> Text
                      </button>
                      <button onClick={() => addBlock('image')} className="flex items-center gap-2 px-4 py-2 bg-studio-panel border border-studio-border rounded-full hover:bg-studio-hover text-studio-dim hover:text-white transition-all text-sm font-medium shadow-sm">
                        <ImageIcon size={16} /> Image
                      </button>
                   </div>
                </div>
              </div>
            )}
            
            {viewMode === 'preview' && (
              <div className="prose prose-invert prose-lg max-w-none bg-studio-panel p-10 rounded-xl border border-studio-border shadow-2xl">
                 <ReactMarkdown>{generateMarkdownString(blocks)}</ReactMarkdown>
              </div>
            )}

            {viewMode === 'code' && (
              <div className="bg-[#0d0d0e] p-0 rounded-xl border border-studio-border shadow-2xl relative overflow-hidden">
                 <div className="flex items-center justify-between px-4 py-3 bg-studio-panel border-b border-studio-border">
                    <span className="text-xs font-mono text-studio-dim">document.md</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(generateMarkdownString(blocks))}
                      className="text-xs text-studio-primary hover:text-white transition-colors flex items-center gap-1"
                    >
                      Copy
                    </button>
                 </div>
                 <div className="p-6 overflow-x-auto">
                    <pre className="font-mono text-sm text-studio-dim leading-relaxed whitespace-pre-wrap break-words">
                        {generateMarkdownString(blocks)}
                    </pre>
                 </div>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;