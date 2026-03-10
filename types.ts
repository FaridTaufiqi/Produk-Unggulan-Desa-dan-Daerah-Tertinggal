
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
  nibLembaga: string;
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
