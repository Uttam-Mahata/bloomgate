'use client';

import { useEffect, useState } from 'react';
import { examsApi, Exam } from '@/lib/api';
import {
  ArrowLeft,
  Printer,
  Download,
  Loader2,
  FileText,
  Eye,
} from 'lucide-react';

interface PdfViewerProps {
  examId: string;
  onClose: () => void;
}

export default function PdfViewer({ examId, onClose }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState('');
  const [exam, setExam] = useState<Exam | null>(null);
  const [includeAnswers, setIncludeAnswers] = useState(false);

  useEffect(() => {
    loadPdf();
  }, [examId, includeAnswers]);

  const loadPdf = async () => {
    try {
      setLoading(true);
      const data = await examsApi.getPdfContent(examId, includeAnswers);
      setHtml(data.html);
      setExam(data.exam);
    } catch (error) {
      console.error('Failed to load PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam?.title.replace(/\s+/g, '_') || 'exam'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn btn-ghost">
              <ArrowLeft size={18} /> Back
            </button>
            <div className="hidden sm:block">
              <h2 className="font-semibold text-sm">{exam?.title || 'Loading...'}</h2>
              <p className="text-xs text-[var(--text-muted)]">
                {exam?.subject} • v{exam?.version}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
              />
              <span className="text-sm">Include Answers</span>
            </label>
            <button onClick={handlePrint} className="btn btn-secondary">
              <Printer size={16} /> <span className="hidden sm:inline">Print</span>
            </button>
            <button onClick={handleDownload} className="btn btn-primary">
              <Download size={16} /> <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-zinc-800">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 size={40} className="mx-auto mb-4 animate-spin text-[var(--accent-primary)]" />
              <p className="text-[var(--text-muted)]">Loading exam paper...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto my-4 sm:my-8 shadow-2xl">
            <iframe
              srcDoc={html}
              className="w-full bg-white rounded-lg"
              style={{ minHeight: '1000px', height: 'auto' }}
              title="Exam PDF Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
