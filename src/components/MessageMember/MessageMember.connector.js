import { connect } from 'react-redux'
import getPerson from 'store/selectors/getPerson'
import getParam from 'store/selectors/getParam'

export function mapStateToProps (state, props) {
  const member = getPerson(state, {personId: getParam('id', state, props)})
  return {
    member
  }
}

export default connect(mapStateToProps)