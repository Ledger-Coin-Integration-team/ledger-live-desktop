// @flow

import React, { PureComponent } from 'react'
import styled from 'styled-components'

import IconSearch from 'icons/Search'

import Box from 'components/base/Box'

const Input = styled.input`
  border: none;
  background: transparent;
  outline: none;
  flex-grow: 1;

  &::placeholder {
    color: ${p => p.theme.colors.warmGrey};
  }
`

class GlobalSearch extends PureComponent<{}> {
  _input = null

  focusInput = () => {
    if (this._input) {
      this._input.focus()
    }
  }

  render() {
    return (
      <Box grow horizontal ff="Open Sans|SemiBold" fontSize={4}>
        <Box justifyContent="center" onClick={this.focusInput} pr={2}>
          <IconSearch height={16} width={16} />
        </Box>
        <Input placeholder="Search" innerRef={input => (this._input = input)} />
      </Box>
    )
  }
}

export default GlobalSearch
