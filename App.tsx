
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RegistrationForm } from './components/RegistrationForm';
import { Footer } from './components/Footer';
import { SubmissionSuccess } from './components/SubmissionSuccess';

const App: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const handleSuccess = (id: string) => {
    setSubmissionId(id);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmissionId('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {!submitted ? (
          <>
            <Hero />
            <section id="form-section" className="py-12 bg-slate-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-red-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">Formulir Identifikasi Produk</h2>
                    <p className="text-red-100 mt-1">Lengkapi data untuk memajukan ekonomi desa Anda.</p>
                  </div>
                  <div className="p-8">
                    <RegistrationForm onSuccess={handleSuccess} />
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <SubmissionSuccess id={submissionId} onReset={handleReset} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
