import { connect } from 'react-redux'
import getMe from 'store/selectors/getMe'
import { isEmpty } from 'lodash/fp'
import { getAttachments } from 'components/AttachmentManager/AttachmentManager.store'
import {
  fetchComments,
  createComment,
  getComments,
  getHasMoreComments,
  getTotalComments
} from './Comments.store'

export function mapStateToProps (state, props) {
  console.log('!!!! comments state, props:', state, props)
  // const editingCommentId = 
  // const imageUrls = getAttachments(state, { type: 'comment', id: , attachmentType: 'image' })
  // const fileUrls = getAttachments(state, { type: 'comment', id: editingPostId, attachmentType: 'file' })
  // const showFiles = !isEmpty(fileUrls) || getUploadPending(state, { type: 'comment', id: editingPostId, attachmentType: 'file' })
  // const showImages = !isEmpty(imageUrls) || getUploadPending(state, { type: 'post', id: editingPostId, attachmentType: 'image' })

  return {
    comments: getComments(state, props),
    total: getTotalComments(state, { id: props.postId }),
    hasMore: getHasMoreComments(state, { id: props.postId }),
    currentUser: getMe(state)
  }
}

export const mapDispatchToProps = (dispatch, props) => {
  const { postId, scrollToBottom } = props
  return {
    fetchCommentsMaker: cursor => () => dispatch(fetchComments(postId, { cursor })),
    createComment: commentParams => dispatch(createComment({ postId, ...commentParams })).then(() => scrollToBottom())
  }
}

export const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { comments } = stateProps
  const { fetchCommentsMaker } = dispatchProps
  const cursor = !isEmpty(comments) && comments[0].id
  const fetchComments = fetchCommentsMaker(cursor)

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    fetchComments
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)
