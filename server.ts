import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config to get project ID and database ID
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

// Helper to get firestore instance
const getFirestore = () => {
  if (firebaseConfig.firestoreDatabaseId) {
    return admin.firestore(firebaseConfig.firestoreDatabaseId);
  }
  return admin.firestore();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/config', (req, res) => {
    res.json({
      appUrl: process.env.APP_URL || ''
    });
  });

  // CSV Export Route for Spreadsheet (IMPORTDATA)
  app.get(['/api/export/csv', '/api/export/csv/'], async (req, res) => {
    console.log('CSV Export requested');
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const firestore = getFirestore();
      console.log('Fetching submissions from Firestore...');
      const snapshot = await firestore.collection('submissions').orderBy('timestamp', 'desc').get();
      const data = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
      console.log(`Found ${data.length} submissions`);

      if (data.length === 0) {
        return res.send('No data available');
      }

      // Define headers
      const headers = [
        'ID', 'Waktu', 'Nama Responden', 'NIK', 'No HP', 'Jabatan',
        'Provinsi', 'Kabupaten', 'Kecamatan', 'Desa',
        'Nama Lembaga', 'Bentuk Lembaga', 'Status Badan Hukum',
        'No Telp Direktur', 'No Telp Sekretaris', 'Jumlah Karyawan',
        'NPWP', 'NIB', 'Tahun Berdiri', 'Alamat',
        'Penyertaan Modal', 'Bagi Hasil PADes', 'Media Sosial',
        'Produk Unggulan', 'Kebutuhan Dukungan',
        'Ada Produk Ekspor', 'Produk Unggulan Ekspor'
      ];

      // Map data to rows
      const rows = data.map((item: any) => {
        const productsStr = (item.products || [])
          .filter((p: any) => p.name)
          .map((p: any, i: number) => {
            return `[PRODUK ${i+1}] Nama: ${p.name}, Kategori: ${p.category}, Deskripsi: ${p.deskripsi}, Mitra: ${p.mitraUsaha}, Kapasitas: ${p.kapasitasBulanan}/bln & ${p.kapasitasTahunan}/thn, Penjualan 2025: ${p.totalPenjualan2025}, Pangsa Pasar: ${(p.pangsaPasar || []).join('/')}, Legalitas: ${(p.legalitas || []).join('/')}, Foto: ${p.fotoUrl || 'Tidak ada'}`;
          })
          .join(' | ');
        
        const needsStr = (item.kebutuhanDukungan || []).join(' | ');

        const exportProductsStr = (item.exportProducts || [])
          .map((p: any, i: number) => {
            return `[EKSPOR ${i+1}] Nama: ${p.nama}, Status: ${p.statusEkspor}, Deskripsi: ${p.deskripsi}, Peran BUMDes: ${p.peranBumdes}, Volume: ${p.volumeEkspor}, Tujuan: ${p.negaraTujuan}, Offtaker: ${p.namaOfftaker || '-'}, Peran Offtaker: ${p.peranOfftaker || '-'}`;
          })
          .join(' | ');

        return [
          item.id,
          new Date(item.timestamp).toLocaleString('id-ID'),
          item.namaResponden,
          `'${item.nikResponden}`,
          item.noHpResponden,
          item.jabatanResponden,
          item.provinsi,
          item.kabupaten,
          item.kecamatan,
          item.desa,
          item.namaLembaga,
          item.lembagaEkonomi,
          item.statusBadanHukum,
          item.noTelpDirektur,
          item.noTelpSekretaris,
          item.jumlahKaryawan,
          item.npwpLembaga,
          item.nibLembaga,
          item.tahunBerdiri,
          (item.alamatLembaga || '').replace(/\n/g, ' '),
          (item.penyertaanModal || '').replace(/\n/g, ' '),
          (item.bagiHasilPADes || '').replace(/\n/g, ' '),
          item.mediaSosial,
          productsStr,
          needsStr,
          item.hasExportProduct || 'Tidak',
          exportProductsStr
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');
      res.send(csvContent);
    } catch (error) {
      console.error('Export Error:', error);
      res.status(500).send('Error generating CSV');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express 5 requires *all for catch-all routes
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
