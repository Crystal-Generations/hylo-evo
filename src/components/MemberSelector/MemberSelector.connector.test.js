import { mapStateToProps, mapDispatchToProps } from './MemberSelector.connector'
import { MODULE_NAME } from './MemberSelector.store'

jest.mock('lodash/fp', () => ({
  ...jest.requireActual('lodash/fp'),
  debounce: (_, fn) => {
    fn.cancel = jest.fn()
    return fn
  }
}))

jest.mock('./MemberSelector.store', () => ({
  ...jest.requireActual('./MemberSelector.store'),
  getMemberMatches: () => jest.fn()
}))

describe('mapStateToProps', () => {
  it('returns the expected keys', () => {
    const state = { [MODULE_NAME]: {} }
    const props = { forCommunities: [] }
    const stateProps = mapStateToProps(state, props)
    expect(stateProps).toMatchSnapshot()
  })
})

describe('mapDispatchToProps', () => {
  it('returns the expected keys', () => {
    const dispatch = r => r
    const result = mapDispatchToProps(dispatch)
    expect(result).toMatchSnapshot()
  })

  it('returns the expected action for fetchPeople', () => {
    const dispatch = r => r
    const result = mapDispatchToProps(dispatch)
    const fetchPeopleResult = result.fetchPeople('searchstring', [1, 2], {})
    expect(fetchPeopleResult).toMatchSnapshot()
  })
})
