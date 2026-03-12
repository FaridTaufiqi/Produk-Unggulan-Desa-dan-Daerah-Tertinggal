
export enum LembagaEkonomiType {
  BUM_DESA = 'BUM Desa',
  KOPERASI = 'Koperasi',
  CV = 'CV',
  PT = 'PT',
  UD = 'UD',
  KOPERASI_MERAH_PUTIH = 'Koperasi Desa Merah Putih',
  LAINNYA = 'Lainnya'
}

export type UserRole = 'admin' | 'desa';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  villageId?: string;
}

export interface VillageProduct {
  name: string;
  category: string;
  legalitas: string[];
  omzetBulanan: string;
  kapasitasProduksi: string;
  description?: string;
}

export enum StatusBadanHukum {
  TERVERIFIKASI_BADAN_HUKUM = 'Terverifikasi Badan Hukum',
  PENDAFTARAN_BADAN_HUKUM = 'Pendaftaran Badan Hukum',
  PERBAIKAN_DOKUMEN_BADAN_HUKUM = 'Perbaikan Dokumen Badan Hukum',
  TERVERIFIKASI_NAMA = 'Terverifikasi Nama',
  PERBAIKAN_NAMA = 'Perbaikan Nama',
  PENDAFTARAN_NAMA = 'Pendaftaran Nama',
  BELUM_MENDAFTAR = 'Belum Mendaftar Badan Hukum'
}

export interface FormState {
  // Identitas Responden
  namaResponden: string;
  nikResponden: string;
  noHpResponden: string;
  jabatanResponden: string;

  // Lokasi
  kodeProvinsi: string;
  provinsi: string;
  kodeKabupaten: string;
  kabupaten: string;
  kodeKecamatan: string;
  kecamatan: string;
  kodeDesa: string;
  desa: string;

  // Identitas Lembaga
  namaLembaga: string;
  lembagaEkonomi: LembagaEkonomiType;
  lembagaEkonomiLainnya?: string;
  statusBadanHukum: StatusBadanHukum;
  noTelpDirektur: string;
  noTelpSekretaris: string;
  jumlahKaryawan: string;
  npwpLembaga: string;
  nibLembaga: string;
  penyertaanModal: string;
  bagiHasilPADes: string;
  mediaSosial: string;
  tahunBerdiri: string;
  alamatLembaga: string;

  // Produk & Kebutuhan
  products: VillageProduct[];
  kebutuhanDukungan: string[];
}

export interface AnalysisResult {
  slogan: string;
  potential: string;
  category: string;
}
