
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RegistrationForm } from './components/RegistrationForm';
import { Footer } from './components/Footer';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { Dashboard } from './components/Dashboard';
import { FormState } from './types';
import { auth, db, collection, onSnapshot, query, orderBy, onAuthStateChanged, User } from './firebase';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'dashboard'>('home');
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [submissions, setSubmissions] = useState<(FormState & { id: string; timestamp: number })[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Handle Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Data Fetching
  useEffect(() => {
    if (!isAuthReady || !user) {
      setSubmissions([]);
      return;
    }

    const q = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as (FormState & { id: string; timestamp: number })[];
      setSubmissions(data);
    }, (error) => {
      console.error("Firestore Snapshot Error: ", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleSuccess = (id: string) => {
    setSubmissionId(id);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmissionId('');
  };

  if (view === 'dashboard') {
    return <Dashboard data={submissions} onBack={() => setView('home')} user={user} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onDashboardClick={() => setView('dashboard')} user={user} />
      
      <main className="flex-grow">
        {!submitted ? (
          <>
            <Hero />
            <section id="form-section" className="py-12 bg-slate-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-red-600 px-8 py-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Formulir Identifikasi Produk</h2>
                      <p className="text-red-100 mt-1">Lengkapi data untuk memajukan ekonomi desa Anda.</p>
                    </div>
                    <button 
                      onClick={() => setView('dashboard')}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-white/20"
                    >
                      {user ? 'Lihat Statistik' : 'Login Admin'}
                    </button>
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
