'use client';

import { useEffect, useState } from 'react';
import { collegesApi, College } from '@/lib/api';

export default function Colleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    contactPerson: '',
    phone: '',
  });

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    try {
      const data = await collegesApi.getAll();
      setColleges(data);
    } catch (error) {
      console.error('Failed to load colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await collegesApi.create(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', address: '', contactPerson: '', phone: '' });
      loadColleges();
    } catch (error) {
      console.error('Failed to create college:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            College Management
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage registered colleges for exam distribution
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <span>+</span> Add College
        </button>
      </div>

      {/* Colleges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-6 w-3/4 mb-4"></div>
              <div className="skeleton h-4 w-1/2 mb-2"></div>
              <div className="skeleton h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🏫</p>
          <p className="text-lg font-medium">No colleges registered</p>
          <p className="text-[var(--text-muted)] mt-1">
            Add colleges to start distributing exam papers
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((college, index) => (
            <div
              key={college.id}
              className="card card-interactive animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                  🎓
                </div>
                <span className={`badge ${college.isActive ? 'badge-success' : 'badge-error'}`}>
                  {college.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2">{college.name}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span>📧</span>
                  <span className="truncate">{college.email}</span>
                </div>
                {college.contactPerson && (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <span>👤</span>
                    <span>{college.contactPerson}</span>
                  </div>
                )}
                {college.phone && (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <span>📞</span>
                    <span>{college.phone}</span>
                  </div>
                )}
                {college.address && (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <span>📍</span>
                    <span className="truncate">{college.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add College Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">Add New College</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  College Name *
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., MIT College of Engineering"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Email *</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="e.g., exams@college.edu"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">Address</label>
                <textarea
                  className="input min-h-[80px]"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Add College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

