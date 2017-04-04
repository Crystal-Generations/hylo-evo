/* eslint-disable no-unused-vars */
import {
  castArray, each, isObject, reduce, uniqWith, snakeCase, toPairs, includes, compact,
  flatten, values, keys, find
} from 'lodash/fp'

import { FETCH_POST, FETCH_FEED_ITEMS } from '../constants'
import { allRelations } from '../models'

const relations = allRelations()
// TODO: these two might be better off in models/index.js
const flattenedRelations = values(relations).reduce((acc, model) => {
  each(key => { acc[key] = model[key] }, keys(model))
  return acc
}, {})
const relationKeys = keys(flattenedRelations)

console.log('relations', relations)
console.log('flattenedRelations', flattenedRelations)
console.log('relationKeys', relationKeys)

export default function normalizingMiddleware ({ dispatch }) {
  return next => action => {
    if (action && action.type) {
      const { type, payload } = action
      switch (type) {
        case FETCH_FEED_ITEMS:
        case FETCH_POST:
          const actions = normalize('data', payload.data)
          console.log('actions', actions)
          each(dispatch)(actions)
          break
      }
      return next(action)
    }
  }
}

function normalize (key, node, actions = []) {
  if (!node) return actions
  const reduceWithKey = reduce.convert({ cap: false })

  var thisAction = null
  var children = []

  if (Array.isArray(node)) {
    children = node.map(child => [key, child])
  } else if (typeof node === 'object') {
    thisAction = makeAction(key, node)
    children = toPairs(node)
  }

  const newActions = reduceWithKey((actions, [key, val]) => {
    return normalize(key, val, actions)
  }, [thisAction, ...actions])(children)

  return compact(newActions)
}

function makeAction (key, node) {
  const relation = flattenedRelations[key]
  if (relation) {
    // TODO: create an action to add normalized version of node. see getRelation below

    const rtype = relation.relationType
    const type = `ADD_${snakeCase(rtype).toUpperCase()}`
    const payload = transform(node, rtype)
    return {type, payload}
  } else {
    return null
  }
}

function normalize2 (graphqlResult) {
  const reduceWithKey = reduce.convert({ cap: false })

  const result = reduceWithKey(
    (actions, relation) => {
      console.log('reduceWithKey')
      console.log('actions', actions)
      console.log('relation', relation)
      return [ ...actions, ...getRelation(relation, graphqlResult) ]
    },
    []
  )(relations)
  return uniqWith(isUniqueAction)(result)
}

function isUniqueAction (a, b) {
  return a.payload.id === b.payload.id && a.type === b.type
}

function getRelation (relation, resultFragment) {
  let result = []
  const eachWithKey = each.convert({ cap: false })

  eachWithKey((entity, key) => {
    if (relation.hasOwnProperty(key)) {
      const rtype = relation[key].relationType
      const type = `ADD_${snakeCase(rtype).toUpperCase()}`
      each(e => {
        result.push({ type, payload: transform(e, rtype) })
      })(castArray(entity))
    } else if (isObject(entity)) {
      result = [ ...getRelation(relation, entity), ...result ]
    }
  })(resultFragment)

  return result
}

function transform (entity, relationType) {
  const reduceWithKey = reduce.convert({ cap: false })
  const relation = relations[relationType]
  return reduceWithKey(
    (transformed, val, key) => {
      if (relation.hasOwnProperty(key)) {
        transformed[key] = relation[key].transform(val)
      } else {
        transformed[key] = val
      }
      return transformed
    },
    {}
  )(entity)
}
