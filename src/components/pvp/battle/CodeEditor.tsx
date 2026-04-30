
import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeEditorProps {
    initialCode?: string;
    language?: string;
    onChange?: (code: string) => void;
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

export const CodeEditor = ({ initialCode = '', language = 'javascript', onChange, onSubmit, isSubmitting }: CodeEditorProps) => {
    const [code, setCode] = useState(initialCode);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setCode(val);
        onChange?.(val);
    };

    const lines = code.split('\n').map((_, i) => i + 1);

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-white/5">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-white/5 bg-[#252526]">
                <div className="flex items-center gap-2 px-2">
                    <div className="text-xs text-gray-400 font-mono">main.py</div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400 hover:text-white">
                        <RotateCcw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                    <Button
                        size="sm"
                        className="h-7 bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 text-xs font-bold"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                    >
                        <Play className="w-3 h-3 mr-1" /> {isSubmitting ? 'Evaluating...' : 'Run Code'}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1 overflow-hidden font-mono text-sm group">
                {/* Line Numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1e1e1e] border-r border-white/5 text-gray-600 text-right pr-2 pt-4 select-none z-10">
                    {lines.map(line => (
                        <div key={line} className="h-6 leading-6">{line}</div>
                    ))}
                </div>

                {/* Textarea */}
                <textarea
                    value={code}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full pl-12 pt-4 pr-4 bg-transparent text-gray-200 resize-none outline-none leading-6 font-mono z-20"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                />
            </div>
        </div>
    );
};
