import { connect } from 'react-redux'
import { isEmpty } from 'lodash/fp'
import getAttachmentsFromObject from 'store/selectors/getAttachmentsFromObject'

export function mapStateToProps (state, props) {
  const imageAttachments = getAttachmentsFromObject(state, {
    type: 'post',
    id: props.postId,
    attachmentType: 'image'
  })

  if (isEmpty(imageAttachments)) return {}

  return {
    firstImageUrl: imageAttachments[0].url,
    otherImageUrls: imageAttachments.slice(1).map(ia => ia.url)
  }
}

export default connect(mapStateToProps)