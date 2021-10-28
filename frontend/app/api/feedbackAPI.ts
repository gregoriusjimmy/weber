import axios, { AxiosError } from "axios"
import { ReviewResponse } from "../types/responses"

type ReviewReqBody = {
  id: number
  session_id: string
  rating: number
  comment: string
}

export const postFeedback = async ({ id, session_id, rating, comment }: ReviewReqBody): Promise<ReviewResponse|undefined> => {
  try {
    const res = await axios.post<ReviewResponse>(`/feedback/${id}`,
      { session_id, rating, comment })
    if (res.data.ok) {
      return res.data
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error((err as AxiosError<ReviewResponse>).message)
    }
  }
}