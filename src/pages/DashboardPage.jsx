import { useEffect, useMemo, useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { Archive, LoaderCircle, SearchX } from 'lucide-react'
import Header from '../components/Header'
import ProjectCard from '../components/ProjectCard'
import SearchBar from '../components/SearchBar'
import SkeletonCard from '../components/SkeletonCard'
import SortFilterBar from '../components/SortFilterBar'
import ToastContainer from '../components/ToastContainer'
import { db } from '../firebase'
import useAuth from '../hooks/useAuth'
import useProjects from '../hooks/useProjects'
import useToast from '../hooks/useToast'
import detectLanguages from '../utils/languageDetector'
import countTotalLines from '../utils/lineCounter'
import { getTimeValue } from '../utils/formatters'
import { isZipFile, readZipProject } from '../utils/zipProject'

function isTypingTarget(element) {
  if (!element) {
    return false
  }

  const tagName = element.tagName
  return (
    element.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  )
}

function compareProjects(left, right, sort) {
  if (sort === 'name') {
    return (left.displayName ?? '').localeCompare(right.displayName ?? '')
  }

  if (sort === 'lastOpened') {
    return getTimeValue(right.lastOpenedAt) - getTimeValue(left.lastOpenedAt)
  }

  if (sort === 'totalLines') {
    return (right.totalLines ?? 0) - (left.totalLines ?? 0)
  }

  if (sort === 'language') {
    return (left.primaryLanguage ?? 'Other').localeCompare(
      right.primaryLanguage ?? 'Other',
    )
  }

  return getTimeValue(right.lastUpdatedAt) - getTimeValue(left.lastUpdatedAt)
}

function getImportErrorMessage(error, sourceType = 'folder') {
  if (error?.code === 'permission-denied') {
    return 'Import failed because Firestore denied the write. Check your Firestore rules and make sure you are signed in.'
  }

  if (error?.code === 'unavailable') {
    return 'Import failed because Firestore is unavailable right now. Please try again in a moment.'
  }

  return sourceType === 'zip'
    ? 'Unable to import that zip archive.'
    : 'Unable to import that project folder.'
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { projects, loading: projectsLoading, error } = useProjects(user?.uid)
  const { toasts, addToast, removeToast } = useToast()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('lastUpdated')
  const [filterLang, setFilterLang] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [darkMode, setDarkMode] = useState(
    () => window.localStorage.getItem('proman-theme') === 'dark',
  )
  const [zipImportState, setZipImportState] = useState({
    active: false,
    message: '',
  })
  const searchInputRef = useRef(null)
  const zipImportInputRef = useRef(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    window.localStorage.setItem('proman-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key !== '/' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTypingTarget(document.activeElement)
      ) {
        return
      }

      event.preventDefault()
      searchInputRef.current?.focus()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (error) {
      addToast('Realtime sync hit an issue. Please try refreshing.', 'error')
    }
  }, [addToast, error])

  const availableLangs = useMemo(
    () =>
      Array.from(
        new Set(projects.map((project) => project.primaryLanguage).filter(Boolean)),
      ).sort((left, right) => left.localeCompare(right)),
    [projects],
  )

  const availableTags = useMemo(
    () =>
      Array.from(
        new Set(projects.flatMap((project) => project.tags ?? []).filter(Boolean)),
      ).sort((left, right) => left.localeCompare(right)),
    [projects],
  )

  const visibleProjects = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    return [...projects]
      .filter((project) => {
        const matchesSearch =
          !searchTerm ||
          (project.displayName ?? '').toLowerCase().includes(searchTerm) ||
          (project.absolutePath ?? '').toLowerCase().includes(searchTerm)

        const matchesLanguage =
          filterLang === 'all' || project.primaryLanguage === filterLang

        const matchesTag =
          filterTag === 'all' ||
          (project.tags ?? []).some(
            (tag) => tag.toLowerCase() === filterTag.toLowerCase(),
          )

        return matchesSearch && matchesLanguage && matchesTag
      })
      .sort((left, right) => compareProjects(left, right, sort))
  }, [filterLang, filterTag, projects, search, sort])

  const pinnedProjects = visibleProjects.filter((project) => project.isPinned)
  const regularProjects = visibleProjects.filter((project) => !project.isPinned)

  async function createProjectEntry({
    projectName,
    entries,
    sourceType,
  }) {
    setZipImportState({
      active: true,
      message: `Analyzing ${entries.length.toLocaleString('en-US')} files from ${projectName}...`,
    })

    const languages = detectLanguages(entries)
    const totalLines = await countTotalLines(entries)
    const timestamp = Timestamp.now()

    setZipImportState({
      active: true,
      message: 'Saving project to your dashboard...',
    })

    await addDoc(collection(db, 'users', user.uid, 'projects'), {
      displayName: projectName,
      absolutePath: '',
      primaryLanguage: Object.keys(languages)[0] ?? 'Other',
      languages,
      totalLines,
      tags: [],
      notes: '',
      sourceType,
      isPinned: false,
      isBroken: sourceType === 'zip',
      createdAt: timestamp,
      lastUpdatedAt: timestamp,
      lastOpenedAt: null,
    })
  }

  async function handleZipImportChange(event) {
    const input = event.target
    const zipFile = event.target.files?.[0] ?? null
    input.value = ''

    if (!user) {
      addToast('You need to be signed in to import projects.', 'error')
      return
    }

    if (!zipFile) {
      return
    }

    if (!isZipFile(zipFile)) {
      addToast('Choose a .zip archive to import.', 'error')
      return
    }

    try {
      setZipImportState({
        active: true,
        message: `Reading ${zipFile.name}...`,
      })

      const { projectName, entries } = await readZipProject(zipFile)

      await createProjectEntry({
        projectName,
        entries,
        sourceType: 'zip',
      })

      addToast(`Imported ${projectName} from zip archive.`, 'success')
      addToast(
        'Set the local project path on the new card so VS Code and Cursor can open the correct folder.',
        'info',
      )
    } catch (error) {
      addToast(error?.message || getImportErrorMessage(error, 'zip'), 'error')
    } finally {
      setZipImportState({ active: false, message: '' })
    }
  }

  async function handleDeleteProject(project) {
    if (!user) {
      addToast('You need to be signed in to remove projects.', 'error')
      return
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'projects', project.id))
      addToast(`Removed ${project.displayName}.`, 'success')
    } catch {
      addToast('Unable to remove that project right now.', 'error')
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#BFDBFE] dark:bg-slate-950">
        <LoaderCircle className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-300" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#BFDBFE] pb-10 dark:bg-slate-950">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-white/40 blur-3xl dark:bg-blue-500/10" />
      <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-500/10" />

      <Header
        user={user}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((current) => !current)}
        addToast={addToast}
      />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                Workspace dashboard
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Open local projects faster than your dock can keep up.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Import zip archives, inspect language mix, fix local project
                paths when needed, and launch the right workspace from one
                searchable command center.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[26rem]">
              <div className="rounded-2xl bg-blue-50 px-4 py-3 dark:bg-blue-500/10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-200">
                  Projects
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {projects.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Pinned
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {projects.filter((project) => project.isPinned).length}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Languages
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {availableLangs.length}
                </p>
              </div>
              <button
                type="button"
                disabled={zipImportState.active}
                onClick={() => zipImportInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {zipImportState.active ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {zipImportState.active ? 'Importing zip...' : 'Import zip'}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            inputRef={searchInputRef}
          />

          <SortFilterBar
            sort={sort}
            onSort={(event) => setSort(event.target.value)}
            filterLang={filterLang}
            onFilterLang={(event) => setFilterLang(event.target.value)}
            filterTag={filterTag}
            onFilterTag={(event) => setFilterTag(event.target.value)}
            availableLangs={availableLangs}
            availableTags={availableTags}
          />
        </section>

        <input
          ref={zipImportInputRef}
          type="file"
          accept=".zip,application/zip"
          disabled={zipImportState.active}
          onChange={handleZipImportChange}
          className="hidden"
        />

        {projectsLoading ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </section>
        ) : null}

        {!projectsLoading && projects.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center shadow-sm dark:border-blue-500/20 dark:bg-slate-900">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
              Nothing imported yet
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              Bring your first local project into ProMan.
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Upload a project zip archive, then set the correct local folder
              path so your IDE shortcuts open the right workspace.
            </p>
            <button
              type="button"
              disabled={zipImportState.active}
              onClick={() => zipImportInputRef.current?.click()}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {zipImportState.active ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              {zipImportState.active ? 'Importing zip...' : 'Upload zip archive'}
            </button>
          </section>
        ) : null}

        {!projectsLoading && projects.length > 0 && visibleProjects.length === 0 ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <SearchX className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
              No projects match this search.
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Try a different folder name, language, or tag filter.
            </p>
          </section>
        ) : null}

        {!projectsLoading && pinnedProjects.length > 0 ? (
          <section className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                📌 Pinned
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your highest-priority workspaces
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pinnedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                  onUpdate={() => {}}
                  onTagClick={setFilterTag}
                  addToast={addToast}
                />
              ))}
            </div>
          </section>
        ) : null}

        {!projectsLoading && regularProjects.length > 0 ? (
          <section className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Projects
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {visibleProjects.length} workspace{visibleProjects.length === 1 ? '' : 's'} ready
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {regularProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                  onUpdate={() => {}}
                  onTagClick={setFilterTag}
                  addToast={addToast}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {zipImportState.active ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
                <LoaderCircle className="h-7 w-7 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                  Importing Zip
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {zipImportState.message}
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              ProMan is reading your archive, counting lines, and saving the new
              project card. Keep this tab open for a moment.
            </p>
          </div>
        </div>
      ) : null}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
