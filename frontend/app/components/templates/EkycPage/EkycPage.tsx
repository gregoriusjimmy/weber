import { parseCookies } from 'nookies'
import { useState } from 'react'
import { postActivities } from '../../../api/activitiesAPI'
import { SESSION_ID_ERROR } from '../../../constants/message'
import { Color, EKYC } from '../../../types/elements'
import { Button } from '../../elements/Button/Button'
import { Modal } from '../../elements/Modal/Modal'
import { Stepper } from '../../elements/Stepper/Stepper'
import { Banner } from '../../modules/Banner/Banner'
import { Cam } from '../../modules/Cam/Cam'
import Feedback from '../../modules/Feedback/Feedback'
import { RequestDemoFormPopup } from '../../modules/RequestDemoFormPopup/RequestDemoFormModal'
import { AnalyticsResult } from '../../modules/AnalyticsResult/AnalyticsResult'
import { postEKYC } from '../../../api/solutionsAPI'
import { getImageFromLocalStorage } from '../../../utils/localStorage/localStorage'
import styles from './EkycPage.module.scss'
import { Spinner } from '../../elements/Spinner/Spinner'

type Props = {
  serviceId: number
  name: string
  shortDesc: string
  longDesc: string
}

export const EkycPage = ({ serviceId, name, shortDesc, longDesc }: Props) => {
  const { session_id } = parseCookies()

  const [currentStep, setCurrentStep] = useState(1)
  const [openModal, setOpenModal] = useState(false)
  const [result, setResult] = useState<EKYC>()
  const [loading, setLoading] = useState(true)

  const createVisitorActivities = async (
    serviceId: number,
    sessionId: string,
    completeness: number
  ) => {
    try {
      await postActivities(serviceId, sessionId, completeness)
    } catch (err) {
      if ((err as Error).message === SESSION_ID_ERROR) {
        setOpenModal(true)
      } else {
        console.log((err as Error).message)
      }
    }
  }

  const handleEKYC = async (sessionId: string) => {
    if (sessionId) {
      await resolveEKYC(sessionId)
      setLoading(false)
    } else {
      setOpenModal(true)
    }
  }

  const resolveEKYC = async (session_id: string) => {
    try {
      const res = await postEKYC(
        session_id,
        getImageFromLocalStorage('liveness_snapshot', () => setCurrentStep(2)),
        getImageFromLocalStorage('ktp_snapshot', () => setCurrentStep(3))
      )

      if (res) {
        setResult(res)
      }
    } catch (err) {
      if ((err as Error).message === SESSION_ID_ERROR) {
        setOpenModal(true)
      } else {
        console.log(err)
      }
    }
  }

  const nextStep = async (page: number) => {
    if (session_id) {
      if (page === 4) {
        handleEKYC(session_id)
      }

      setCurrentStep(page)
      createVisitorActivities(5, session_id, page - 1)
    } else {
      setOpenModal(true)
    }
  }

  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <RequestDemoFormPopup />
      </Modal>

      <Banner
        analyticsName={name}
        shortDescription={shortDesc}
        longDescription={longDesc}
      />

      <Stepper
        steps={['Start', 'Face Liveness', 'OCR KTP', 'Result', 'Finish']}
        activeStep={currentStep}
      />

      <div className={styles.container}>
        {currentStep === 1 && (
          <div>
            <h3 className={styles.title}>Welcome to e-KYC Demo</h3>
            <p className={styles.desc}>
              Please access this demo via smartphone or any device with at least
              HD camera resolution for better performance and experience
            </p>
            <Button color={Color.Primary} onClick={() => nextStep(2)}>
              Start
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className={styles.title}>Take A Selfie Photo</h3>
            <Cam localkey="liveness_snapshot" nextStep={() => nextStep(3)} />
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 className={styles.title}>KTP Photo</h3>
            <Cam
              localkey="ktp_snapshot"
              nextStep={() => nextStep(4)}
              videoConstraints={{ facingMode: { ideal: 'environment' } }}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className={styles.result}>
            <div className={styles.percentage}>
              <h3 className={styles.title}>Liveness result</h3>
              {!loading && result ? (
                <>
                  <span>{`${Math.trunc(
                    result.face_liveness.liveness * 100
                  )}%`}</span>
                  <p>
                    {result.face_liveness.live ? 'Verified' : 'Not Verified'}
                  </p>
                </>
              ) : (
                <Spinner />
              )}
            </div>

            <div className={styles.percentage}>
              <h3 className={styles.title}>Face Match Result</h3>
              {!loading && result ? (
                <>
                  <span>{`${Math.trunc(
                    result.face_match.similarity * 100
                  )}%`}</span>
                  <p>{result.face_match.match ? 'Verified' : 'Not Verified'}</p>
                </>
              ) : (
                <Spinner />
              )}
            </div>

            <div className={styles.ocrKtp}>
              <h3 className={styles.title}>OCR KTP Result</h3>
              {!loading && result ? (
                <AnalyticsResult result={result.ocr_ktp} slug={'ocr-ktp'} />
              ) : (
                <Spinner />
              )}
            </div>

            <Button
              color={Color.Primary}
              onClick={() => nextStep(5)}
              disabled={loading}>
              Next
            </Button>
          </div>
        )}

        {currentStep === 5 && (
          <div className={styles.review}>
            <h3 className={styles.title}>
              Thank you for Using e-KYC Demo App!
            </h3>
            <Feedback
              id={serviceId}
              onTryAgain={() => setCurrentStep(1)}
              afterSubmit={() => createVisitorActivities(5, session_id, 5)}
            />
          </div>
        )}
      </div>
    </>
  )
}
