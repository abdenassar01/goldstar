import type { Route } from "./+types/_index";
import { useQuery } from "convex/react";
import { api } from "@goldstart/backend/convex/_generated/api";
import { useSearchParams } from "react-router";
import type { Id } from "@goldstart/backend/convex/_generated/dataModel";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01FreeIcons, ArrowRight01FreeIcons } from "@hugeicons/core-free-icons";

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
		<div className="container mx-auto flex flex-col justify-center items-center p-3">
			<h1 className="text-5xl font-bold text-primary mb-8 animate-fade-in-down">goldstart</h1>
			<div className="grid gap-6 p-3 backdrop-blur-xl bg-white/5 rounded-3xl animate-fade-in-up">
				{step === 1 && (
					<section className="">
						{categories === undefined ? (
							<div className="text-sm text-muted-foreground">Loading categories…</div>
						) : categories.length === 0 ? (
							<div className="text-sm text-muted-foreground">No categories.</div>
						) : (
							<div className="grid grid-cols-2 grid-rows-1 gap-4 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
								{categories.map((c) => {
									const iconUrl = categoryIcons?.find((x) => x.storageId === (c.icon as Id<"_storage">))?.url ?? undefined;
									return (
										<button
											key={c._id}
											onClick={() => selectCategory(c._id)}
											className="rounded-xl text-left transition hover:border-primary hover:bg-primary/5 transform hover:scale-105 duration-300 ease-in-out"
										>
											{iconUrl ? (
												<img alt="" src={iconUrl} className="w-full rounded-lg aspect-square border object-contain bg-white" />
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
					<section className="animate-fade-in-up">
						<button onClick={() => updateParams((p) => p.delete("category_id"))} className="text-sm p-1 rounded-xl bg-primary/10 text-primary mb-4">
							<HugeiconsIcon icon={ArrowLeft01FreeIcons} />
						</button>
						{marks === undefined ? (
							<div className="text-sm text-muted-foreground">Loading marks…</div>
						) : marks.length === 0 ? (
							<div className="text-sm text-muted-foreground">No marks.</div>
						) : (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
								{marks.map((m) => {
									const iconUrl = markIcons?.find((x) => x.storageId === (m.icon as Id<"_storage">))?.url ?? undefined;
									return (
										<button
											key={m._id}
											onClick={() => selectMark(m._id)}
											className="rounded-lg border text-left transition hover:border-primary hover:bg-primary/5 transform hover:scale-105 duration-300 ease-in-out"
										>
											{iconUrl ? (
												<img alt="" src={iconUrl} className="w-full rounded object-contain aspect-square bg-white" />
											) : (
												<div className="w-20 border bg-muted" />
											)}

										</button>
									);
								})}
							</div>
						)}
					</section>
				)}

				{step === 3 && (
					<section className="rounded-lg border p-4 animate-fade-in-up">
						<button onClick={() => updateParams((p) => p.delete("mark_id"))} className="text-sm text-primary mb-4">← Back to marks</button>
						<div className="mb-3">
							<input
								type="text"
								value={q}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search items…"
								className="w-full rounded-md border px-3 py-2 text-sm bg-transparent backdrop-blur-sm"
							/>
						</div>
						{items === undefined ? (
							<div className="text-sm text-muted-foreground">Loading items…</div>
						) : items.length === 0 ? (
							<div className="text-sm text-muted-foreground">No items found.</div>
						) : (
							<ul className="divide-y rounded-md border bg-transparent backdrop-blur-sm">
								{items.map((it) => (
									<li key={it._id} className="flex flex-col items-center justify-between gap-3 p-4">
										<div>
											<div className="font-medium text-lg">{it.name}</div>
											{it.description ? (
												<div className="text-sm text-muted-foreground line-clamp-2">{it.description}</div>
											) : null}
										</div>

										{it.variants && it.variants.length > 0 ? (
											it.variants.map((v, i) => (
												<div key={i} className="whitespace-nowrap text-base font-medium text-primary">
													{v.name}: {v.price.toFixed(2)} DH
												</div>
											))
										) : (
											<div className="whitespace-nowrap text-sm text-muted-foreground">No variants</div>
										)}
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
