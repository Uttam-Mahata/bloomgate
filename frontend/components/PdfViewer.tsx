'use client';

import { useEffect, useState } from 'react';
import { examsApi, Exam, Question } from '@/lib/api';

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
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="btn btn-ghost">
              ← Back
            </button>
            <div>
              <h2 className="font-semibold">{exam?.title || 'Loading...'}</h2>
              <p className="text-sm text-[var(--text-muted)]">
                {exam?.subject} • v{exam?.version}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
              🖨️ Print
            </button>
            <button onClick={handleDownload} className="btn btn-primary">
              ⬇️ Download
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-zinc-800">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[var(--text-muted)]">Loading exam paper...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto my-8 shadow-2xl">
            <iframe
              srcDoc={html}
              className="w-full bg-white rounded-lg"
              style={{ minHeight: '1200px', height: 'auto' }}
              title="Exam PDF Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}

