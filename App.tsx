
import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RegistrationForm } from './components/RegistrationForm';
import { Footer } from './components/Footer';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { Dashboard } from './components/Dashboard';
import { FormState, UserProfile } from './types';
import { auth, db, collection, onSnapshot, query, orderBy, onAuthStateChanged, User, doc, getDoc, setDoc, where, handleFirestoreError, OperationType } from './firebase';
import { AlertCircle, RefreshCcw } from 'lucide-react';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-slate-500 mb-8">Aplikasi mengalami kendala teknis. Silakan coba muat ulang halaman.</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCcw size={20} />
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const AppContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'dashboard'>('home');
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [submissions, setSubmissions] = useState<(FormState & { id: string; timestamp: number; uid: string; docId: string })[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Handle Authentication and Profile Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Sync user profile with Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const existingProfile = userDoc.data() as UserProfile;
            const shouldBeAdmin = firebaseUser.email === 'faridtaufiqibusiness@gmail.com' && firebaseUser.emailVerified;
            
            if ((shouldBeAdmin && existingProfile.role !== 'admin') || (!shouldBeAdmin && existingProfile.role === 'admin')) {
              const updatedProfile = {
                ...existingProfile,
                role: shouldBeAdmin ? 'admin' : 'desa'
              };
              await setDoc(userDocRef, updatedProfile, { merge: true });
              setUserProfile(updatedProfile);
            } else {
              setUserProfile(existingProfile);
            }
          } else {
            // Create new profile
            const isAdmin = firebaseUser.email === 'faridtaufiqibusiness@gmail.com' && firebaseUser.emailVerified;
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              role: isAdmin ? 'admin' : 'desa'
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Auth Sync Error:", error);
      } finally {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Data Fetching
  useEffect(() => {
    if (!isAuthReady || !user || !userProfile) {
      setSubmissions([]);
      return;
    }

    // Admin sees all, Desa sees only their own
    let q;
    try {
      if (userProfile.role === 'admin') {
        q = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
      } else {
        q = query(
          collection(db, 'submissions'), 
          where('uid', '==', user.uid)
        );
      }
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          docId: doc.id
        })) as (FormState & { id: string; timestamp: number; uid: string; docId: string })[];
        
        // Sort client-side for non-admin users
        const sortedData = userProfile.role === 'admin' 
          ? data 
          : data.sort((a, b) => b.timestamp - a.timestamp);
          
        setSubmissions(sortedData);
      }, (error) => {
        console.error("Firestore Snapshot Error: ", error);
        try {
          handleFirestoreError(error, OperationType.LIST, 'submissions');
        } catch (e) {
          // Logged
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Query Setup Error:", error);
    }
  }, [isAuthReady, user, userProfile]);

  const handleSuccess = (id: string) => {
    setSubmissionId(id);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmissionId('');
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Menyiapkan Aplikasi...</p>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return <Dashboard data={submissions} onBack={() => setView('home')} user={user} userProfile={userProfile} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onDashboardClick={() => setView('dashboard')} 
        onHomeClick={() => setView('home')} 
        user={user} 
        userProfile={userProfile} 
      />
      
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
                      {user ? 'Lihat Dashboard' : 'Login Petugas'}
                    </button>
                  </div>
                  <div className="p-8">
                    <RegistrationForm onSuccess={handleSuccess} user={user} />
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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
