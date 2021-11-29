export enum Color {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Quaternary = 'quaternary'
}

export enum AnalyticsSlug {
  FACE_MATCH_ENROLLMENT = 'face-match-enrollment',
  LICENSE_PLATE_RECOGNITION = 'license-plate-recognition',
  OCR_KTP = 'ocr-ktp'
}

export type Service = {
  id: number
  name: string
  thumbnail: string
  short_description: string
  long_description: string
  slug: string
  type: string
}

export type RequestDemoFormData = {
  email: string
  full_name: string
  company: string
  job_title: string
  industry: string
}

export type FeedbackData = {
  rating: number
  comment: string
}

export type ShoppingItem = {
  id: string
  quantity: number
  name: string
  image: string
  price: number
}

export type FaceLiveness = {
  live: boolean
  liveness: number
}

export type FaceMatch = {
  match: boolean
  similarity: number
}

export type OCRKTP = {
  agama: string
  alamat: string
  berlaku_hingga: string
  golongan_darah: string
  jenis_kelamin: string
  kabupaten_kota: string
  kecamatan: string
  kelurahan_desa: string
  kewarganegaraan: string
  nama: string
  nik: string
  pekerjaan: string
  provinsi: string
  rt_rw: string
  status_perkawinan: string
  tanggal_lahir: string
  tempat_lahir: string
}

export type MenuInfo = {
  title: string
  onClick: () => void
}

export type ReceiptItem = {
  qty: string
  name: string
  price: string
  total: string
}

export interface OCRReceiptData {
  address: string
  number: string
  date: string
  info: string[]
  item: ReceiptItem[]
}

export type PaymentAccountInfo = {
  full_name: string
  phone: string
  have_twin: boolean
  balance: number
  minimum_payment: number
}
