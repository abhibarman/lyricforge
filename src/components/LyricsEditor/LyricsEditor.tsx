import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { LyricsSection as LyricsSectionType } from '../../types'
import { countWords, serializeLyrics } from '../../utils/lyricsParser'

type LyricsEditorProps = {
  sections: LyricsSectionType[]
  onChange: (sections: LyricsSectionType[]) => void
}

export function LyricsEditor({ sections, onChange }: LyricsEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const totalWords = sections.reduce((total, section) => total + countWords(section.body), 0)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((section) => section.id === active.id)
    const newIndex = sections.findIndex((section) => section.id === over.id)
    onChange(arrayMove(sections, oldIndex, newIndex))
  }

  if (sections.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center text-sm text-slate-500">
        Generated lyrics will appear here.
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Lyrics Editor</h2>
          <p className="text-sm text-slate-400">{totalWords} words total</p>
        </div>
        <button
          className="icon-button rounded-lg px-3 py-2 text-sm font-medium"
          type="button"
          onClick={() => void navigator.clipboard.writeText(serializeLyrics(sections))}
        >
          Copy lyrics
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableLyricsSection
                key={section.id}
                section={section}
                onChange={(nextSection) =>
                  onChange(sections.map((item) => (item.id === section.id ? nextSection : item)))
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}

function SortableLyricsSection({
  section,
  onChange,
}: {
  section: LyricsSectionType
  onChange: (section: LyricsSectionType) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <article ref={setNodeRef} style={style} className="studio-card rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <button
          className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
          type="button"
          aria-label={`Drag ${section.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>
        <input
          className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-slate-100 outline-none focus:border-slate-600"
          value={section.title}
          onChange={(event) => onChange({ ...section, title: event.target.value })}
        />
        <span className="whitespace-nowrap text-xs text-slate-500">{countWords(section.body)} words</span>
      </div>
      <textarea
        className="field min-h-32 font-serif text-base leading-7"
        value={section.body}
        onChange={(event) => onChange({ ...section, body: event.target.value })}
      />
    </article>
  )
}
