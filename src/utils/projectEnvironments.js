import { DEFAULT_PROJECT_ENVIRONMENTS } from '../constants/projectEnvironments'

function createEmptyEnvironment() {
  return {
    absolutePath: '',
    notes: '',
    isBroken: false,
    lastOpenedAt: null,
  }
}

export function buildProjectEnvironments(devEnvironment = {}) {
  return Object.fromEntries(
    DEFAULT_PROJECT_ENVIRONMENTS.map((environment) => [
      environment,
      environment === 'DEV'
        ? {
            ...createEmptyEnvironment(),
            ...devEnvironment,
          }
        : createEmptyEnvironment(),
    ]),
  )
}

export function getProjectEnvironmentNames(project) {
  const storedEnvironmentNames = Object.keys(project?.environments ?? {})

  return Array.from(
    new Set([...DEFAULT_PROJECT_ENVIRONMENTS, ...storedEnvironmentNames]),
  )
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
    getProjectEnvironmentNames(project).map((environment) => {
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
  return getProjectEnvironmentNames(project).map(
    (environment) => getProjectEnvironment(project, environment).absolutePath,
  ).filter(Boolean)
}
