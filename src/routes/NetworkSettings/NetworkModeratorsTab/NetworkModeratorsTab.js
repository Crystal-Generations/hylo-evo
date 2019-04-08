import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from 'components/Button'
import Loading from 'components/Loading'
import Autocomplete from 'react-autocomplete'
import { isEmpty, intersection } from 'lodash/fp'
import PaginatedList from '../PaginatedList'
import '../NetworkSettings.scss'
import Avatar from 'components/Avatar'
import cx from 'classnames'

const { any, array, bool, func, number, object } = PropTypes

export default class NetworkModeratorsTab extends Component {
  static propTypes = {
    addNetworkModeratorRole: func.isRequired,
    fetchModeratorAutocomplete: func.isRequired,
    isAdmin: bool,
    moderators: array,
    moderatorsPage: number,
    moderatorsPageCount: number,
    moderatorsPending: any,
    network: object,
    removeNetworkModeratorRole: func.isRequired
  }

  state = {
    moderatorChoice: null,
    moderatorSearch: ''
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.moderatorsPage !== this.props.moderatorsPage &&
    isEmpty(this.props.moderators)) {
      this.props.fetchModerators()
    }
  }

  addModerator = () => {
    const { moderatorChoice } = this.state
    if (moderatorChoice) {
      const moderatedCommunityIds = moderatorChoice.moderatedCommunityMemberships.map(mcm => mcm.community.id)
      const { communities } = this.props
      const networkCommunityIds = communities.map(c => c.id)
      const networkModeratedCommunityIds = intersection(networkCommunityIds, moderatedCommunityIds)

      var confirmed = true

      if (isEmpty(networkModeratedCommunityIds)) {
        confirmed = window.confirm(`${moderatorChoice.name} is not a moderator of any of the communities in this network. Are you sure you want to add them as a network moderator?`)
      }

      if (confirmed) {
        this.props.addNetworkModeratorRole(moderatorChoice.id)
      }

      this.setState({
        moderatorChoice: null,
        moderatorSearch: ''
      })
    }
  }

  chooseModerator = (_, person) => {
    this.setState({
      moderatorChoice: person,
      moderatorSearch: person.name
    })
  }

  moderatorAutocomplete = ({ target: { value } }) => {
    this.setState({ moderatorSearch: value })
    this.props.fetchModeratorAutocomplete(value)
  }

  render () {
    const {
      moderatorsPage,
      moderatorsPageCount,
      moderatorsPending,
      moderatorAutocompleteCandidates,
      network,
      removeNetworkModeratorRole,
      setModeratorsPage
    } = this.props

    if (!network) return <Loading />

    return <div>
      <PaginatedList styleName='moderators'
        items={network.moderators}
        label={'Moderators'}
        page={moderatorsPage}
        pageCount={moderatorsPageCount}
        pending={moderatorsPending}
        removeItem={removeNetworkModeratorRole(network.id)}
        setPage={setModeratorsPage} />
      <div styleName='autocomplete'>
        <Autocomplete
          getItemValue={person => person.name}
          inputProps={{
            placeholder: "Start typing a person's name",
            style: {
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '3px',
              width: '400px'
            }
          }}
          items={moderatorAutocompleteCandidates}
          renderItem={(person, isHighlighted) => <div key={person.id}>
            <ModeratorSuggestionRow person={person} isHighlighted={isHighlighted} />
          </div>}
          value={this.state.moderatorSearch}
          onChange={this.moderatorAutocomplete}
          onSelect={this.chooseModerator}
        />
        <Button label='Add Moderator' color={'green'} onClick={this.addModerator} styleName='button' />
      </div>
    </div>
  }
}

export class ModeratorSuggestionRow extends Component {
  render () {
    const { person, isHighlighted } = this.props
    const { name, avatarUrl } = person
    return <div styleName={cx('moderatorSuggestionRow', {blueBorder: isHighlighted})}>
      <Avatar avatarUrl={avatarUrl} small styleName='moderatorSuggestionAvatar' /> {name}
    </div>
  }
}