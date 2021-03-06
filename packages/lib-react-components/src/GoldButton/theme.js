import { adjustHue } from 'polished'
import { css } from 'styled-components'

const theme = {
  button: {
    border: {
      color: 'neutral-4',
      width: '1px'
    },
    color: {
      dark: 'neutral-4',
      light: 'black'
    },
    primary: {
      color: {
        dark: 'dark-3',
        light: 'neutral-4'
      }
    },
    extend: props => {
      const { theme: { dark, global: { colors } } } = props
      const backgroundColor = dark ? colors['neutral-4'] : adjustHue(-7, colors['neutral-4'])
      return css`
        text-align: center;
        &:disabled {
          cursor: not-allowed;
        }
        &:focus:not(:disabled),
        &:hover:not(:disabled) {
          background: ${backgroundColor};
          box-shadow: 1px 1px 2px rgba(0, 0, 0, .5);
          color: black;
        }
    `}
  }
}

export default theme
