import { useMemo } from 'react'
import { css } from '@emotion/css'
import theme from 'theme/Theme'

const useClasses = (stylesElement) => {
  return useMemo(() => {
    const rawClasses = typeof stylesElement === 'function' ? stylesElement(theme) : stylesElement
    const prepared = {}

    Object.entries(rawClasses).forEach(([key, value = {}]) => {
      prepared[key] = css(value)
    })

    return prepared
  }, [stylesElement, theme])
}

export default useClasses
