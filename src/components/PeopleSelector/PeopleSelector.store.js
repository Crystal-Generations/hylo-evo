import { createSelector } from 'redux-orm'
import { pick } from 'lodash/fp'
import orm from 'store/models'

export const MODULE_NAME = 'PeopleSelector'

export const FETCH_PEOPLE = 'FETCH_PEOPLE'
export const PEOPLE_SELECTOR_SET_AUTOCOMPLETE = 'PEOPLE_SELECTOR_SET_AUTOCOMPLETE'
export const PEOPLE_SELECTOR_ADD_PARTICIPANT = 'PEOPLE_SELECTOR_ADD_PARTICIPANT'
export const PEOPLE_SELECTOR_REMOVE_PARTICIPANT = 'PEOPLE_SELECTOR_REMOVE_PARTICIPANT'

const fetchPeopleQuery =
`query PersonAutocomplete ($autocomplete: String, $first: Int) {
  people (autocomplete: $autocomplete, first: $first) {
    items {
      id
      name
      avatarUrl
      memberships {
        id
        community {
          id
          name
        }
      }
    }
  }
}`

export function fetchPeople (autocomplete, query = fetchPeopleQuery, first = 20) {
  return {
    type: FETCH_PEOPLE,
    graphql: {
      query,
      variables: { autocomplete, first }
    },
    meta: { extractModel: 'Person' }
  }
}

export function addParticipant (id) {
  return {
    type: PEOPLE_SELECTOR_ADD_PARTICIPANT,
    payload: id
  }
}

export function removeParticipant (id) {
  return {
    type: PEOPLE_SELECTOR_REMOVE_PARTICIPANT,
    payload: id
  }
}

export function setAutocomplete (autocomplete) {
  return {
    type: PEOPLE_SELECTOR_SET_AUTOCOMPLETE,
    payload: autocomplete
  }
}

export const participantsSelector = createSelector(
  orm,
  state => state.orm,
  state => state[MODULE_NAME].participants,
  (session, participants) => participants.map(id => pick(
    [ 'id', 'name', 'avatarUrl' ],
    session.Person.withId(id).ref
  ))
)

export const matchesSelector = createSelector(
  orm,
  state => state.orm,
  state => state[MODULE_NAME].autocomplete,
  (session, autocomplete) => {
    if (autocomplete) {
      const term = autocomplete.toLowerCase()
      const matches = session.Person
        .all()
        .filter(p => p.name.toLowerCase().includes(term))
        .orderBy('name')
        .toRefArray()
      if (matches.length > 0) {
        matches[0].active = true
      }
      return matches
    }
    return null
  }
)

export const defaultState = {
  participants: []
}

export default function reducer (state = defaultState, action) {
  const { error, payload, type } = action
  if (error) return state

  switch (type) {
    case PEOPLE_SELECTOR_SET_AUTOCOMPLETE:
      return {
        ...state,
        autocomplete: payload
      }

    case PEOPLE_SELECTOR_ADD_PARTICIPANT:
      return {
        ...state,
        participants: [ ...state.participants, payload ]
      }

    case PEOPLE_SELECTOR_REMOVE_PARTICIPANT:
      return {
        ...state,
        participants: state.participants.filter(p => p !== payload)
      }
  }

  return state
}
