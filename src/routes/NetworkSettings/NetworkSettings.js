import React, { PropTypes, Component } from 'react'
import './NetworkSettings.scss'
import Loading from 'components/Loading'
import Button from 'components/Button'
import ChangeImageButton from 'components/ChangeImageButton'
import RemovableListItem from 'components/RemovableListItem'
import SettingsControl from 'components/SettingsControl'
const { object, func } = PropTypes
import FullPageModal from 'routes/FullPageModal'
import { bgImageStyle } from 'util/index'
import {
  bannerUploadSettings, avatarUploadSettings, DEFAULT_BANNER, DEFAULT_AVATAR
} from 'store/models/Network'
import { times, isEmpty } from 'lodash/fp'

export default class NetworkSettings extends Component {
  static propTypes = {
    network: object,
    updateNetworkSettings: func,
    fetchNetworkSettings: func,
    setConfirm: func
  }

  constructor (props) {
    super(props)
    this.state = {edits: {}, changed: false}
  }

  componentDidMount () {
    this.props.fetchNetworkSettings()
    this.setEditState()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.network !== this.props.network) {
      this.props.fetchNetworkSettings()
      this.setEditState()
    }
    if (prevProps.moderatorsPage !== this.props.moderatorsPage &&
      isEmpty(this.props.moderators)) {
      this.props.fetchModerators()
    }
    if (prevProps.communitiesPage !== this.props.communitiesPage &&
      isEmpty(this.props.communities)) {
      this.props.fetchCommunities()
    }
  }

  setEditState () {
    const { network } = this.props

    if (!network) return

    const {
      name, description, avatarUrl, bannerUrl
    } = network

    this.setState({
      edits: {
        name: name || '',
        description: description || '',
        avatarUrl: avatarUrl || DEFAULT_AVATAR,
        bannerUrl: bannerUrl || DEFAULT_BANNER
      }
    })
  }

  render () {
    const {
      network,
      updateNetworkSettings,
      moderators,
      communities,
      setConfirm,
      moderatorsPage,
      moderatorsPageCount,
      setModeratorsPage,
      communitiesPage,
      communitiesPageCount,
      setCommunitiesPage
    } = this.props
    if (!network) return <FullPageModal><Loading /></FullPageModal>

    const { edits, changed } = this.state
    const {
      name, description, avatarUrl, bannerUrl
    } = edits

    const updateSetting = (key, setChanged = true) => event => {
      const { edits, changed } = this.state
      setChanged && setConfirm('You have unsaved changes, are you sure you want to leave?')
      this.setState({
        changed: setChanged ? true : changed,
        edits: {
          ...edits,
          [key]: event.target.value
        }
      })
    }

    const updateSettingDirectly = (key, changed) => value =>
      updateSetting(key, changed)({target: {value}})

    const save = () => {
      this.setState({changed: false})
      setConfirm(false)
      updateNetworkSettings(edits)
    }

    return <FullPageModal narrow>
      <div>
        <input type='text' styleName='name' onChange={updateSetting('name')} value={name || ''} />
        <div style={bgImageStyle(bannerUrl)} styleName='banner'>
          <ChangeImageButton
            update={updateSettingDirectly('bannerUrl')}
            uploadSettings={bannerUploadSettings(network)}
            styleName='change-banner-button' />
        </div>
        <div style={bgImageStyle(avatarUrl)} styleName='avatar'>
          <ChangeImageButton
            update={updateSettingDirectly('avatarUrl')}
            uploadSettings={avatarUploadSettings(network)}
            styleName='change-avatar-button' />
        </div>
        <SettingsControl label='Description' onChange={updateSetting('description')} value={description} type='textarea' />
        <div styleName='button-row'>
          <Button label='Save Changes' color={changed ? 'green' : 'gray'} onClick={changed ? save : null} styleName='save-button' />
        </div>
        <Moderators
          moderators={moderators}
          page={moderatorsPage}
          pageCount={moderatorsPageCount}
          setPage={setModeratorsPage} />
        <Communities
          communities={communities}
          page={communitiesPage}
          pageCount={communitiesPageCount}
          setPage={setCommunitiesPage} />
      </div>
    </FullPageModal>
  }
}

export function Moderators ({ moderators, page, pageCount, setPage }) {
  return <div styleName='moderators'>
    <div styleName='section-label'>Moderators</div>
    {moderators.map(m => <RemovableListItem item={m} key={m.id} />)}
    <Pagination page={page} pageCount={pageCount} setPage={setPage} />
  </div>
}

export function Communities ({ communities, page, pageCount, setPage }) {
  return <div styleName='communities'>
    <div styleName='section-label'>Communities</div>
    {communities.map(c => <RemovableListItem item={c} key={c.id} square size={40} />)}
    <Pagination page={page} pageCount={pageCount} setPage={setPage} />
  </div>
}

export function Pagination ({ pageCount, setPage, page }) {
  const PageLink = ({ i }) => {
    const current = i === page
    return <span styleName={current ? 'page-current' : 'page-link'} onClick={() => !current && setPage(i)}>{i + 1}</span>
  }

  return <div styleName='pagination'>
    {times(i => <PageLink key={i} i={i} />, pageCount)}
  </div>
}
