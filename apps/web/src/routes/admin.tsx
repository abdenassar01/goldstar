import React, { useMemo, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@goldstart/backend/convex/_generated/api'
import type { Id } from '@goldstart/backend/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { FileUpload } from '@/components/ui/file-upload'

// Sidebar tabs
const TABS = [
  { key: 'items', label: 'Items' },
  { key: 'categories', label: 'Categories' },
  { key: 'marks', label: 'Marks' },
] as const

type TabKey = typeof TABS[number]['key']

export default function Admin() {
  const [active, setActive] = useState<TabKey>('items')

  return (
    <main className="pt-16 container mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 p-4">
      <aside className="md:sticky md:top-16 h-fit border rounded-md">
        <nav className="p-2">
          <ul className="space-y-1">
            {TABS.map(t => (
              <li key={t.key}>
                <Button
                  variant={active === t.key ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setActive(t.key)}
                >
                  {t.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <section>
        {active === 'items' && <ItemsManager />}
        {active === 'categories' && <SimpleTableManager table="categories" />}
        {active === 'marks' && <SimpleTableManager table="marks" />}
      </section>
    </main>
  )
}

function ItemsManager() {
  const [search, setSearch] = useState('')
  const items = useQuery(api.items.list, useMemo(() => ({ search }), [search]))
  const categories = useQuery(api.categories.list, {})
  const marks = useQuery(api.marks.list, {})
  const removeItem = useMutation(api.items.remove)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<null | ReturnType<typeof useItemDraft>>(null)

  const onAdd = () => {
    setEditing(useItemDraft())
    setOpen(true)
  }
  const onEdit = (doc: NonNullable<typeof items>[number]) => {
    setEditing(useItemDraft(doc))
    setOpen(true)
  }
  const onDelete = async (id: Id<'items'>) => {
    if (!confirm('Delete this item?')) return
    try {
      await removeItem({ id })
    } catch (e) {
      console.error(e)
      alert('Failed to delete item')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={onAdd}>Add Item</Button>
      </div>

      <Card className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Mark</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Variants</th>
              <th className="py-2 pr-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((it) => (
              <tr key={it._id} className="border-b last:border-b-0">
                <td className="py-2 pr-3 font-medium">{it.name}</td>
                <td className="py-2 pr-3">{categories?.find(c=>c._id===it.categoryId)?.name ?? '—'}</td>
                <td className="py-2 pr-3">{marks?.find(m=>m._id===it.markId)?.name ?? '—'}</td>
                <td className="py-2 pr-3">{it.price ?? '—'}</td>
                <td className="py-2 pr-3">{it.variants?.length ?? 0}</td>
                <td className="py-2 pr-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(it)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(it._id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {items && items.length === 0 && (
              <tr>
                <td className="py-6 text-center text-muted-foreground" colSpan={6}>No items found</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <ItemModal
        open={open}
        onOpenChange={setOpen}
        draft={editing}
        setDraft={setEditing}
        categories={categories ?? []}
        marks={marks ?? []}
      />
    </div>
  )
}

// Draft and modal for items
function useItemDraft(init?: any) {
  return {
    id: init?._id as Id<'items'> | undefined,
    name: init?.name ?? '',
    description: init?.description ?? '',
    price: init?.price ?? undefined as number | undefined,
    coverImage: init?.coverImage as Id<'_storage'> | undefined,
    gallery: init?.gallery ?? ([] as Id<'_storage'>[]),
    categoryId: init?.categoryId as Id<'categories'> | undefined,
    markId: init?.markId as Id<'marks'> | undefined,
    variants: (init?.variants ?? []) as { name: string; price: number }[],
  }
}

type ItemDraft = ReturnType<typeof useItemDraft>

function ItemModal({ open, onOpenChange, draft, setDraft, categories, marks }:{
  open: boolean
  onOpenChange: (v: boolean) => void
  draft: ItemDraft | null
  setDraft: (d: ItemDraft | null) => void
  categories: { _id: Id<'categories'>; name: string }[]
  marks: { _id: Id<'marks'>; name: string }[]
}) {
  const createItem = useMutation(api.items.create)
  const updateItem = useMutation(api.items.update)
  const [submitting, setSubmitting] = useState(false)

  if (!open || !draft) return null

  const close = () => {
    setDraft(null)
    onOpenChange(false)
  }

  const d = draft as NonNullable<ItemDraft>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!d.name || !d.coverImage || !d.categoryId || !d.markId) {
      alert('Name, Cover image, Category and Mark are required')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        name: d.name,
        description: d.description || undefined,
        price: typeof d.price === 'number' ? d.price : undefined,
        coverImage: d.coverImage as Id<'_storage'>,
        gallery: d.gallery.length ? d.gallery : undefined,
        categoryId: d.categoryId as Id<'categories'>,
        markId: d.markId as Id<'marks'>,
        variants: d.variants.map(v => ({ name: v.name, price: Number(v.price) || 0 })),
      }
      if (d.id) {
        await updateItem({ id: d.id, ...payload })
      } else {
        await createItem(payload)
      }
      close()
    } catch (e) {
      console.error(e)
      alert('Failed to save item')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={close} title={d.id ? 'Edit Item' : 'Add Item'} className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={d.name} onChange={e=>setDraft({ ...d, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input type="number" step="0.01" value={d.price ?? ''} onChange={e=>setDraft({ ...d, price: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea value={d.description ?? ''} onChange={e=>setDraft({ ...d, description: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              className="border rounded-md h-10 px-3 bg-background"
              value={d.categoryId ?? ''}
              onChange={e => setDraft({ ...d, categoryId: e.target.value as unknown as Id<'categories'> })}
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Mark</Label>
            <select
              className="border rounded-md h-10 px-3 bg-background"
              value={d.markId ?? ''}
              onChange={e => setDraft({ ...d, markId: e.target.value as unknown as Id<'marks'> })}
              required
            >
              <option value="" disabled>Select a mark</option>
              {marks.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload
            label="Cover Image"
            multiple={false}
            value={d.coverImage ? [d.coverImage] : []}
            onChange={(ids) => setDraft({ ...d, coverImage: ids[0] })}
          />
          <FileUpload
            label="Gallery"
            multiple
            value={d.gallery}
            onChange={(ids) => setDraft({ ...d, gallery: ids })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Variants</Label>
            <Button type="button" variant="outline" onClick={() => setDraft({ ...d, variants: [...d.variants, { name: '', price: 0 }] })}>Add Variant</Button>
          </div>
          <div className="space-y-2">
            {d.variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <Input
                  className="md:col-span-6"
                  placeholder="Variant name"
                  value={v.name}
                  onChange={e => {
                    const variants = [...d.variants]
                    variants[idx] = { ...variants[idx], name: e.target.value }
                    setDraft({ ...d, variants })
                  }}
                />
                <Input
                  className="md:col-span-4"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={v.price}
                  onChange={e => {
                    const variants = [...d.variants]
                    variants[idx] = { ...variants[idx], price: Number(e.target.value) }
                    setDraft({ ...d, variants })
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="md:col-span-2 text-destructive"
                  onClick={() => {
                    const variants = d.variants.filter((_, i) => i !== idx)
                    setDraft({ ...d, variants })
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            {d.variants.length === 0 && (
              <div className="text-sm text-muted-foreground">No variants. Add at least one if needed.</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// Generic manager for categories and marks
function SimpleTableManager({ table }: { table: 'categories' | 'marks' }) {
  const list = useQuery(table === 'categories' ? api.categories.list : api.marks.list, {})
  const create = useMutation(table === 'categories' ? api.categories.create : api.marks.create)
  const update = useMutation(table === 'categories' ? api.categories.update : api.marks.update)
  const remove = useMutation(table === 'categories' ? api.categories.remove : api.marks.remove)

  type RowId = Id<'categories'> | Id<'marks'>
  const [form, setForm] = useState<{ id?: RowId; name: string; icon?: string }>({ name: '' })
  const [open, setOpen] = useState(false)

  const title = table === 'categories' ? 'Categories' : 'Marks'

  const onAdd = () => {
    setForm({ name: '' })
    setOpen(true)
  }
  const onEdit = (row: any) => {
    setForm({ id: row._id as RowId, name: row.name, icon: row.icon as string | undefined })
    setOpen(true)
  }
  const onDelete = async (id: RowId) => {
    if (!confirm(`Delete this ${table.slice(0,-1)}?`)) return
    try {
      if (table === 'categories') {
        await remove({ id: id as Id<'categories'> })
      } else {
        await remove({ id: id as Id<'marks'> })
      }
    } catch (e) { console.error(e); alert('Delete failed') }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (!form.icon) {
        alert('Icon image is required')
        return
      }
      if (form.id) {
        if (table === 'categories') {
          await update({ id: form.id as Id<'categories'>, name: form.name, icon: form.icon })
        } else {
          await update({ id: form.id as Id<'marks'>, name: form.name, icon: form.icon })
        }
      } else {
        await create({ name: form.name, icon: form.icon })
      }
      setOpen(false)
    } catch (e) {
      console.error(e)
      alert('Save failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button onClick={onAdd}>Add</Button>
      </div>
      <Card className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Icon</th>
              <th className="py-2 pr-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list?.map((row: any) => (
              <tr key={row._id} className="border-b last:border-b-0">
                <td className="py-2 pr-3 font-medium">{row.name}</td>
                <td className="py-2 pr-3">{row.icon ? 'Image' : '—'}</td>
                <td className="py-2 pr-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(row)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(row._id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {list && list.length === 0 && (
              <tr>
                <td className="py-6 text-center text-muted-foreground" colSpan={3}>No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={`${form.id ? 'Edit' : 'Add'} ${title.slice(0, -1)}`}>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <FileUpload
              label=""
              multiple={false}
              value={form.icon ? [form.icon as unknown as Id<'_storage'>] : []}
              onChange={(ids) => setForm({ ...form, icon: ids[0] as unknown as string })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
