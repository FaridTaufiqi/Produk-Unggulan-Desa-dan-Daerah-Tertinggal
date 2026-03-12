
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RegistrationForm } from './components/RegistrationForm';
import { Footer } from './components/Footer';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { Dashboard } from './components/Dashboard';
import { FormState, UserProfile } from './types';
import { auth, db, collection, onSnapshot, query, orderBy, onAuthStateChanged, User, doc, getDoc, setDoc, where } from './firebase';

const App: React.FC = () => {
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
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Sync user profile with Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // Create new profile
          const isAdmin = firebaseUser.email === 'faridtaufiqibusiness@gmail.com';
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
      
      setIsAuthReady(true);
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
    // IMPORTANT: Query must match security rules to avoid permission errors
    let q;
    if (userProfile.role === 'admin') {
      q = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
    } else {
      // Remove orderBy to avoid composite index requirement for non-admin users
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
    });

    return () => unsubscribe();
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

  if (view === 'dashboard') {
    return <Dashboard data={submissions} onBack={() => setView('home')} user={user} userProfile={userProfile} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onDashboardClick={() => setView('dashboard')} user={user} userProfile={userProfile} />
      
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

export default App;
