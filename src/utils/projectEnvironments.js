import { PROJECT_ENVIRONMENTS } from '../constants/projectEnvironments'

function createEmptyEnvironment() {
  return {
    absolutePath: '',
    notes: '',
    isBroken: false,
    lastOpenedAt: null,
  }
}

export function buildProjectEnvironments(devEnvironment = {}) {
  return {
    DEV: {
      ...createEmptyEnvironment(),
      ...devEnvironment,
    },
    STG: createEmptyEnvironment(),
    PROD: createEmptyEnvironment(),
  }
}

export function getProjectEnvironments(project) {
  const legacyDevEnvironment = {
    ...createEmptyEnvironment(),
    absolutePath: project?.absolutePath ?? '',
    notes: project?.notes ?? '',
    isBroken: Boolean(project?.isBroken),
    lastOpenedAt: project?.lastOpenedAt ?? null,
  }

  return Object.fromEntries(
    PROJECT_ENVIRONMENTS.map((environment) => {
      const fallbackEnvironment =
        environment === 'DEV' ? legacyDevEnvironment : createEmptyEnvironment()
      const storedEnvironment = project?.environments?.[environment] ?? {}

      return [
        environment,
        {
          ...fallbackEnvironment,
          ...storedEnvironment,
        },
      ]
    }),
  )
}

export function getProjectEnvironment(project, environment = 'DEV') {
  return getProjectEnvironments(project)[environment] ?? createEmptyEnvironment()
}

export function getProjectPathValues(project) {
  return PROJECT_ENVIRONMENTS.map(
    (environment) => getProjectEnvironment(project, environment).absolutePath,
  ).filter(Boolean)
}
