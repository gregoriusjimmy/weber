import { errorHandler } from '@/utils/errorHandler'
import axios from 'axios'
import { EKYCResultResponse } from '../types/responses'

export const postEKYC = async (
  sessionId: string,
  facePhoto: string,
  ocrPhoto: string
): Promise<EKYCResultResponse | undefined> => {
  try {
    const res = await axios.post<EKYCResultResponse>('/ekyc', {
      session_id: sessionId,
      data: {
        face_liveness: {
          images: [facePhoto]
        },
        ocr_ktp: {
          images: [ocrPhoto]
        },
        face_match: {
          images: [facePhoto, ocrPhoto]
        }
      }
    })

    return res.data
  } catch (e) {
    errorHandler(e)
  }
}
