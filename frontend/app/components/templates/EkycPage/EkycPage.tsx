import { parseCookies } from 'nookies'
import { useState } from 'react'
import Image from 'next/image'
import { postActivities } from '../../../api/activitiesAPI'
import { SESSION_ID_ERROR } from '../../../constants/message'
import { Color } from '../../../types/elements'
import { Button } from '../../elements/Button/Button'
import { Modal } from '../../elements/Modal/Modal'
import { Stepper } from '../../elements/Stepper/Stepper'
import { Banner } from '../../modules/Banner/Banner'
import { Cam } from '../../modules/Cam/Cam'
import { DropzoneOptions } from '../../modules/DropzoneOptions/DropzoneOptions'
import Feedback from '../../modules/Feedback/Feedback'
import { RequestDemoFormPopup } from '../../modules/RequestDemoFormPopup/RequestDemoFormModal'
import styles from './EkycPage.module.scss'

type Props = {
  serviceId: number
  name: string
  shortDesc: string
  longDesc: string
}

export const EkycPage = ({ serviceId, name, shortDesc, longDesc }: Props) => {
  const examples = [
    `/assets/images/analytics/ocr-ktp/example1.jpg`,
    `/assets/images/analytics/ocr-ktp/example2.jpg`,
    `/assets/images/analytics/ocr-ktp/example3.jpg`
  ]

  const [photo, setPhoto] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [openModal, setOpenModal] = useState(false)

  const nextStep = async (page: number) => {
    const { session_id } = parseCookies()
    if (session_id) {
      setCurrentStep(page)
    } else {
      setOpenModal(true)
    }
  }

  const getImageFromLocalStorage = (
    key: string,
    fallbackStep: number
  ): string => {
    const image = localStorage.getItem(key)

    if (!image) {
      setCurrentStep(fallbackStep)
      return ''
    }

    return image
  }

  return (
    <>
      <Modal
        show={openModal}
        onClose={() => {
          setOpenModal(false)
        }}>
        <RequestDemoFormPopup />
      </Modal>

      <Banner
        analyticsName={name}
        shortDescription={shortDesc}
        longDescription={longDesc}
      />

      <Stepper
        steps={[
          'Start',
          'Face Liveness',
          'OCR KTP',
          'Face Match 1:1',
          'Result',
          'Finish'
        ]}
        activeStep={currentStep}
      />

      {currentStep === 1 && (
        <div className={styles.container}>
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
        </div>
      )}

      {currentStep === 2 && (
        <div className={styles.container}>
          <Cam localkey="liveness_snapshot" nextStep={() => nextStep(3)} />
        </div>
      )}

      {currentStep === 3 && (
        <div className={styles.dzContainer}>
          <DropzoneOptions images={examples} onPhotoDrop={setPhoto} />
          {photo && (
            <div className={styles.buttonContainer}>
              <Button
                color={Color.Primary}
                onClick={async () => {
                  localStorage.setItem('ktp_image', photo)
                  nextStep(4)
                }}>
                Next Step
              </Button>
            </div>
          )}
        </div>
      )}

      {currentStep === 4 && (
        <div className={styles.container}>
          <div className={styles.imgContainer}>
            <Image
              src={getImageFromLocalStorage('liveness_snapshot', 2)}
              height={180}
              width={243}
            />
            <Image
              className={styles.imgItem}
              src={getImageFromLocalStorage('ktp_image', 3)}
              height={180}
              width={243}
            />
            <div className={styles.btnGroup}>
              <Button color={Color.Primary}>Change Image</Button>
              <Button color={Color.Primary} onClick={() => nextStep(5)}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 6 && (
        <div className={styles.container}>
          <Feedback id={serviceId} onClick={() => setCurrentStep(1)} />
        </div>
      )}
    </>
  )
}
