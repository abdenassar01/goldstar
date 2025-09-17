import type { Route } from "./+types/_index";
import { useQuery } from "convex/react";
import { api } from "@goldstart/backend/convex/_generated/api";
import { useSearchParams } from "react-router";
import type { Id } from "@goldstart/backend/convex/_generated/dataModel";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "goldstart" },
		{ name: "description", content: "goldstart is a web application" },
	];
}

export default function Home() {
	const [searchParams, setSearchParams] = useSearchParams();

	const categoryId = searchParams.get("category_id");
	const markId = searchParams.get("mark_id");
	const q = searchParams.get("q") ?? "";

	const categories = useQuery(api.categories.list, { search: undefined });
	const marks = useQuery(api.marks.list, { search: undefined });
	const items = useQuery(api.items.list, {
		categoryId: (categoryId as Id<"categories">) || undefined,
		markId: (markId as Id<"marks">) || undefined,
		search: q || undefined,
	});

	// Resolve storageId icons to URLs (batched)
	const categoryIconIds = (categories?.map((c) => c.icon as Id<"_storage">) ?? []);
	const categoryIcons = useQuery(
		api.files.getFileUrls,
		categories ? { storageIds: categoryIconIds } : "skip",
	);
	const markIconIds = (marks?.map((m) => m.icon as Id<"_storage">) ?? []);
	const markIcons = useQuery(
		api.files.getFileUrls,
		marks ? { storageIds: markIconIds } : "skip",
	);

	const step = !categoryId ? 1 : !markId ? 2 : 3;

	function updateParams(mutator: (p: URLSearchParams) => void) {
		const next = new URLSearchParams(searchParams);
		mutator(next);
		setSearchParams(next, { replace: true });
	}

	function selectCategory(id: string) {
		updateParams((p) => {
			p.set("category_id", id);
			p.delete("mark_id");
			p.delete("q");
		});
	}

	function selectMark(id: string) {
		updateParams((p) => {
			p.set("mark_id", id);
			p.delete("q");
		});
	}

	function setQuery(next: string) {
		updateParams((p) => {
			if (next && next.length > 0) p.set("q", next);
			else p.delete("q");
		});
	}

	return (
		<div className="container mx-auto flex justify-center items-center p-4">
			<div className="grid gap-6">
				{step === 1 && (
					<section className="">
						{categories === undefined ? (
							<div className="text-sm text-muted-foreground">Loading categories…</div>
						) : categories.length === 0 ? (
							<div className="text-sm text-muted-foreground">No categories.</div>
						) : (
							<div className="grid grid-cols-2 grid-rows-1 gap-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
								{categories.map((c) => {
									const iconUrl = categoryIcons?.find((x) => x.storageId === (c.icon as Id<"_storage">))?.url ?? undefined;
									return (
										<button
											key={c._id}
											onClick={() => selectCategory(c._id)}
											className="rounded-lg border p-2 text-left transition hover:border-primary hover:bg-primary/5"
										>
											{iconUrl ? (
												<img alt="" src={iconUrl} className="w-full rounded border object-cover" />
											) : (
												<div className="w-20 rounded border bg-muted" />
											)}
											<div className="font-medium mt-3 text-center text-primary">{c.name}</div>

										</button>
									);
								})}
							</div>
						)}
					</section>
				)}

				{step === 2 && (
					<section className="">
						{marks === undefined ? (
							<div className="text-sm text-muted-foreground">Loading marks…</div>
						) : marks.length === 0 ? (
							<div className="text-sm text-muted-foreground">No marks.</div>
						) : (
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
								{marks.map((m) => {
									const iconUrl = markIcons?.find((x) => x.storageId === (m.icon as Id<"_storage">))?.url ?? undefined;
									return (
										<button
											key={m._id}
											onClick={() => selectMark(m._id)}
											className="rounded-lg border p-3 text-left transition hover:border-primary hover:bg-primary/5"
										>
											{iconUrl ? (
												<img alt="" src={iconUrl} className="w-full rounded object-contain aspect-square" />
											) : (
												<div className="w-20 border bg-muted" />
											)}
											<div className="font-medium mt-3 text-center text-primary">{m.name}</div>
										</button>
									);
								})}
							</div>
						)}
					</section>
				)}

				{step === 3 && (
					<section className="rounded-lg border p-4">
						<div className="mb-3">
							<input
								type="text"
								value={q}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search items…"
								className="w-full rounded-md border px-2 py-2 text-sm"
							/>
						</div>
						{items === undefined ? (
							<div className="text-sm text-muted-foreground">Loading items…</div>
						) : items.length === 0 ? (
							<div className="text-sm text-muted-foreground">No items found.</div>
						) : (
							<ul className="divide-y rounded-md border">
								{items.map((it) => (
									<li key={it._id} className="flex items-center justify-between gap-3 p-3">
										<div>
											<div className="font-medium">{it.name}</div>
											{it.description ? (
												<div className="text-xs text-muted-foreground line-clamp-1">{it.description}</div>
											) : null}
										</div>
										{typeof it.price === "number" ? (
											<div className="text-sm tabular-nums">${""}{it.price.toFixed(2)}</div>
										) : null}
									</li>
								))}
							</ul>
						)}
					</section>
				)}
			</div>
		</div>
	);
}
