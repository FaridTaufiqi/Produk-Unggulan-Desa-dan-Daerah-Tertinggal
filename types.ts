
export enum LembagaEkonomiType {
  BUM_DESA = 'BUM Desa',
  KOPERASI = 'Koperasi',
  CV = 'CV',
  PT = 'PT',
  UD = 'UD',
  KOPERASI_MERAH_PUTIH = 'Koperasi Desa Merah Putih',
  LAINNYA = 'Lainnya'
}

export interface VillageProduct {
  name: string;
  profileFile: File | null;
  description?: string;
}

export interface FormState {
  kodeProvinsi: string;
  provinsi: string;
  kodeKabupaten: string;
  kabupaten: string;
  kodeKecamatan: string;
  kecamatan: string;
  kodeDesa: string;
  desa: string;
  lembagaEkonomi: LembagaEkonomiType;
  lembagaEkonomiLainnya?: string;
  alamatLembaga: string;
  products: VillageProduct[];
}

export interface AnalysisResult {
  slogan: string;
  potential: string;
  category: string;
}
