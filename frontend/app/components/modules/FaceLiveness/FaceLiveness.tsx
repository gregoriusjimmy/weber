import { parseCookies } from 'nookies'
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useState
} from 'react'
import { postServicePhoto } from '../../../api/analyticsAPI'
import { SESSION_ID_ERROR } from '../../../constants/message'
import { FACE_LIVENESS_ID } from '../../../constants/services'
import { Color } from '../../../types/elements'
import { FaceLiveness as FL } from '../../../types/responses'
import { Button } from '../../elements/Button/Button'
import { Cam } from '../../modules/Cam/Cam'
import styles from './FaceLiveness.module.scss'

type Props = {
  nextStep: MouseEventHandler<HTMLButtonElement>
  setOpenModal: Dispatch<SetStateAction<boolean>>
  createVisitorActivities: (serviceId: number, sessionId: string, completeness: number) => void
}

export const FaceLiveness = ({
  nextStep,
  setOpenModal,
  createVisitorActivities,
}: Props) => {
  const [isResult, setIsResult] = useState(false)
  const [result, setResult] = useState<FL | undefined>(undefined)

  const { session_id } = parseCookies()

  useEffect(() => {
    createVisitorActivities(5, session_id, 40)
  }, [])

  const handleAnalytics = async () => {
    if (session_id) {
      createVisitorActivities(5, session_id, 50)
      await resolveAnalytics(session_id)
    }
  }

  const resolveAnalytics = async (session_id: string) => {
    try {
      const photo = localStorage.getItem('liveness_snapshot')
      if (photo) {
        const res = await postServicePhoto(
          FACE_LIVENESS_ID,
          session_id,
          photo,
          'face-liveness'
        )
        if (res) {
          setResult(res as FL)
          setIsResult(true)
          createVisitorActivities(5, session_id, 60)
        }
      }
    } catch (err) {
      if ((err as Error).message === SESSION_ID_ERROR) {
        setOpenModal(true)
      } else {
        console.log((err as Error).message)
      }
    }
  }

  return (
    <>
      {isResult === false && (
        <Cam localkey="liveness_snapshot" nextStep={() => handleAnalytics()} />
      )}

      {isResult && !result && <div>Loading...</div>}

      {isResult && result && (
        <div className={styles.result}>
          <h3 className={styles.head}>Liveness Result</h3>

          <p className={styles.body}>
            {`${Math.trunc(result.face_liveness.liveness * 100)}%`}
          </p>

          <div className={styles.btnGroup}>
            <Button
              color={Color.Primary}
              onClick={nextStep}
              disabled={result.face_liveness.live === false}>
              Next
            </Button>
            <Button color={Color.Primary} onClick={() => setIsResult(false)}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
