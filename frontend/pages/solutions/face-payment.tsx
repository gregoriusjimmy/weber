import { getServiceBySlug } from "../../app/api/analyticsAPI"
import { FacePaymentPage } from "../../app/components/templates/FacePaymentPage/FacePaymentPage"

interface Props {
  id: number,
  name: string,
  short_description: string,
  long_description: string
}

const FacePayment: React.FC<Props> = (props) => {
  return (
    <>
      <FacePaymentPage {...props}/>
    </>
  )
}

export const getServerSideProps = async () => {
  try {
    const res = await getServiceBySlug('face-payment')
    return {
      props: {
        ...res?.data
      }
    }
  } catch {
    return {
      notFound: true
    }
  }
}

export default FacePayment