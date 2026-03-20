import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { getTimeValue } from '../utils/formatters'

function sortProjects(projects) {
  return [...projects].sort((left, right) => {
    if (Boolean(left.isPinned) !== Boolean(right.isPinned)) {
      return left.isPinned ? -1 : 1
    }

    return getTimeValue(right.lastUpdatedAt) - getTimeValue(left.lastUpdatedAt)
  })
}

export default function useProjects(uid) {
  const [state, setState] = useState(() => ({
    uid,
    projects: [],
    loading: Boolean(uid),
    error: null,
  }))

  useEffect(() => {
    if (!uid) {
      return undefined
    }

    const unsubscribe = onSnapshot(
      collection(db, 'users', uid, 'projects'),
      (snapshot) => {
        const nextProjects = snapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        }))

        setState({
          uid,
          projects: sortProjects(nextProjects),
          error: null,
          loading: false,
        })
      },
      (nextError) => {
        setState({
          uid,
          projects: [],
          error: nextError,
          loading: false,
        })
      },
    )

    return unsubscribe
  }, [uid])

  if (!uid) {
    return { projects: [], loading: false, error: null }
  }

  const isCurrentUserState = state.uid === uid

  return {
    projects: isCurrentUserState ? state.projects : [],
    loading: isCurrentUserState ? state.loading : true,
    error: isCurrentUserState ? state.error : null,
  }
}
