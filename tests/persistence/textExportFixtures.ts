import type { PortableExportData } from '@/modules/settings/types/settingsExports'

export const generatedAt = new Date('2026-07-13T08:30:00.000Z')

export const textExportFixture = Object.freeze({
  locale: 'en-US',
  generatedAt,
  tasks: Object.freeze([
    Object.freeze({
      id: 'task-active',
      title: '=SUM(1,2)',
      dueDate: '2026-07-14',
      label: '  @planning',
      completedAt: null,
      deletedAt: null,
      createdAt: '2026-07-10T08:00:00.000Z',
      updatedAt: '2026-07-10T08:00:00.000Z',
    }),
    Object.freeze({
      id: 'task-completed',
      title: '完成 <script>alert(1)</script> `review`',
      dueDate: null,
      label: '中文 / emoji ✅',
      completedAt: '2026-07-12T09:00:00.000Z',
      deletedAt: null,
      createdAt: '2026-07-09T08:00:00.000Z',
      updatedAt: '2026-07-12T09:00:00.000Z',
    }),
    Object.freeze({
      id: 'task-deleted',
      title: 'PRIVATE-DELETED-CANARY',
      dueDate: '2026-07-15',
      label: null,
      completedAt: null,
      deletedAt: '2026-07-12T10:00:00.000Z',
      createdAt: '2026-07-08T08:00:00.000Z',
      updatedAt: '2026-07-12T10:00:00.000Z',
    }),
  ]),
  countdowns: Object.freeze([
    Object.freeze({
      id: 'countdown-expired',
      title: '# Launch\n- checklist',
      targetDate: '2026-01-01',
      createdAt: '2025-12-01T08:00:00.000Z',
      updatedAt: '2025-12-01T08:00:00.000Z',
    }),
  ]),
  bookmarks: Object.freeze([
    Object.freeze({
      id: 'bookmark-pinned',
      title: 'Docs [safe] ![image](bad)',
      url: 'https://example.test/path_(guide)?a=1&b=2#part',
      category: '+Reference | <img onerror=alert(1)>',
      note: 'First line\n> quoted <script>alert(1)</script>',
      pinned: true,
      createdAt: '2026-07-01T08:00:00.000Z',
      updatedAt: '2026-07-12T08:00:00.000Z',
    }),
    Object.freeze({
      id: 'bookmark-plain',
      title: '中文资料 ✅',
      url: 'https://example.test/unicode?q=%E4%B8%AD%E6%96%87',
      category: null,
      note: null,
      pinned: false,
      createdAt: '2026-07-02T08:00:00.000Z',
      updatedAt: '2026-07-11T08:00:00.000Z',
    }),
  ]),
} satisfies PortableExportData)

export const emptyTextExportFixture = Object.freeze({
  locale: 'zh-CN',
  generatedAt,
  tasks: Object.freeze([]),
  countdowns: Object.freeze([]),
  bookmarks: Object.freeze([]),
} satisfies PortableExportData)
