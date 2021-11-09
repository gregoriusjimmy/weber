import { BaseSyntheticEvent, useEffect, useState } from 'react'
import { Button } from '@/elements/Button/Button'
import { Color } from '@/types/elements'
import styles from './PaymentSetup.module.scss'

const MIN_PAYMENT = 100000
const MAX_PAYMENT = 1000000
const STEP_PAYMENT = 50000
const TICK_INTERVAL = 100000

type Props = {
  onChange: Function
  onSuccess: Function
}

export const PaymentSetup = ({ onChange, onSuccess }: Props) => {
  const [value, setValue] = useState(MIN_PAYMENT)
  const [typedInput, setTypedInput] = useState('')

  const ticks = Array.from(
    { length: Math.floor((MAX_PAYMENT - MIN_PAYMENT) / TICK_INTERVAL) + 1 },
    (_, i: number) => MIN_PAYMENT + i * TICK_INTERVAL
  )

  const handleInputChange = (e: BaseSyntheticEvent) => {
    const typed = e.target.value
    if (typed === '') {
      setTypedInput(e.target.value)
    } else if (/^[0-9\b]+$/.test(typed)) {
      setTypedInput(e.target.value)
      if (+typed >= MIN_PAYMENT && +typed <= MAX_PAYMENT) {
        setValue(+typed)
      }
    }
  }

  const handleSlideChange = (e: BaseSyntheticEvent) => {
    setValue(+e.target.value)
    setTypedInput('')
  }

  useEffect(() => {
    onChange(value)
  }, [value])

  return (
    <div className={styles.modalPayment}>
      <h2>Set up your minimum payment</h2>
      <span className={styles.value}>{value.toLocaleString()}</span>
      <p>
        If the payment exceeds the minimum payment, you are required to input
        pin
      </p>
      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min={MIN_PAYMENT}
          max={MAX_PAYMENT}
          step={STEP_PAYMENT}
          list="tickmarks"
          value={value}
          className={styles.slider}
          onChange={handleSlideChange}
        />
        <datalist id="tickmarks">
          {ticks.map((v: number, i: number) => (
            <option value={v} key={i} />
          ))}
        </datalist>
      </div>
      <span>You could type your nominal below</span>
      <input
        type="text"
        value={typedInput}
        maxLength={6}
        onChange={handleInputChange}
        className={styles.inputNominal}
      />
      <Button type="button" color={Color.Primary} onClick={() => onSuccess()}>
        Next
      </Button>
    </div>
  )
}
