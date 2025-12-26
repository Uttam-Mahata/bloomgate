'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import QuestionBank from '@/components/QuestionBank';
import ExamPapers from '@/components/ExamPapers';
import GenerateExam from '@/components/GenerateExam';
import Colleges from '@/components/Colleges';
import Distribution from '@/components/Distribution';
import BloomJoinSync from '@/components/BloomJoinSync';
import PdfViewer from '@/components/PdfViewer';
import { Exam } from '@/lib/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pdfViewerExamId, setPdfViewerExamId] = useState<string | null>(null);

  const handleViewPdf = (examId: string) => {
    setPdfViewerExamId(examId);
  };

  const handleDistribute = (_exam: Exam) => {
    setActiveTab('distribute');
  };

  const handleExamGenerated = (_exam: Exam) => {
    setActiveTab('exams');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'questions':
        return <QuestionBank />;
      case 'exams':
        return <ExamPapers onViewPdf={handleViewPdf} onDistribute={handleDistribute} />;
      case 'generate':
        return <GenerateExam onGenerated={handleExamGenerated} />;
      case 'colleges':
        return <Colleges />;
      case 'distribute':
        return <Distribution />;
      case 'sync':
        return <BloomJoinSync />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <main className="main-content">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* PDF Viewer Modal */}
      {pdfViewerExamId && (
        <PdfViewer examId={pdfViewerExamId} onClose={() => setPdfViewerExamId(null)} />
      )}
    </div>
  );
}
