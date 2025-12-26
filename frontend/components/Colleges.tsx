'use client';

import { useEffect, useState } from 'react';
import { collegesApi, College } from '@/lib/api';
import {
  Plus,
  Building2,
  Mail,
  User,
  Phone,
  MapPin,
  GraduationCap,
  X,
} from 'lucide-react';

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
    <div className="section-gap">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-md">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-sm">
            <Building2 size={24} className="text-[var(--accent-primary)]" />
            College Management
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Manage registered colleges for exam distribution
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Add College
        </button>
      </div>

      {/* Colleges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-3/4 mb-4"></div>
              <div className="skeleton h-4 w-1/2 mb-2"></div>
              <div className="skeleton h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
          <p className="text-lg font-medium">No colleges registered</p>
          <p className="text-[var(--text-muted)] mt-1 text-sm">
            Add colleges to start distributing exam papers
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {colleges.map((college, index) => (
            <div
              key={college.id}
              className="card card-interactive animate-fade-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="icon-wrapper icon-wrapper-md bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <GraduationCap size={20} />
                </div>
                <span className={`badge ${college.isActive ? 'badge-success' : 'badge-error'}`}>
                  {college.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-semibold text-base mb-3 line-clamp-1">{college.name}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Mail size={14} className="flex-shrink-0" />
                  <span className="truncate">{college.email}</span>
                </div>
                {college.contactPerson && (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <User size={14} className="flex-shrink-0" />
                    <span>{college.contactPerson}</span>
                  </div>
                )}
                {college.phone && (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Phone size={14} className="flex-shrink-0" />
                    <span>{college.phone}</span>
                  </div>
                )}
                {college.address && (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <MapPin size={14} className="flex-shrink-0" />
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New College</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-md">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-sm">
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
                <label className="block text-sm text-[var(--text-muted)] mb-sm">Email *</label>
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
                <label className="block text-sm text-[var(--text-muted)] mb-sm">
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
                <label className="block text-sm text-[var(--text-muted)] mb-sm">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-sm">Address</label>
                <textarea
                  className="input min-h-[80px]"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address..."
                />
              </div>

              <div className="flex gap-md pt-md">
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
