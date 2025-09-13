import { ItemCard } from "@/components/cards/item-card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@goldstart/backend/convex/_generated/api";
import type { Doc } from "@goldstart/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useState } from "react";

export default function Browse() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string | undefined>(undefined);
	const [mark, setMark] = useState<string | undefined>(undefined);
	const categories = useQuery(api.categories.list, {});
	const marks = useQuery(api.marks.list, {});
	const items = useQuery(api.items.list, {
		categoryId: category as Doc<"categories">["_id"] | undefined,
		markId: mark as Doc<"marks">["_id"] | undefined,
		search,
	});

	const hydratedItems =
		items?.map((item) => {
			const category = categories?.find((c) => c._id === item.categoryId) ?? null;
			const mark = marks?.find((m) => m._id === item.markId) ?? null;
			return {
				...item,
				category,
				mark,
			};
		}) ?? [];

	return (
		<main className="grid grid-cols-12 gap-8 container mx-auto pt-8">
			<aside className="col-span-3">
				<div className="grid gap-4">
					<h2 className="text-2xl font-bold">Filters</h2>
					<Input
						placeholder="Search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<Select onValueChange={(value) => setCategory(value === "all" ? undefined : value)}>
						<SelectTrigger>
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							{categories?.map((category) => (
								<SelectItem key={category._id} value={category._id}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select onValueChange={(value) => setMark(value === "all" ? undefined : value)}>
						<SelectTrigger>
							<SelectValue placeholder="Mark" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							{marks?.map((mark) => (
								<SelectItem key={mark._id} value={mark._id}>
									{mark.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</aside>
			<section className="col-span-9">
				<div className="grid grid-cols-3 gap-4">
					{hydratedItems.map((item) => (
						<ItemCard key={item._id} item={item} />
					))}
				</div>
			</section>
		</main>
	);
}