import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { api } from "@goldstart/backend/convex/_generated/api";
import type { Doc, Id } from "@goldstart/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

interface ItemFormProps {
	item?: Doc<"items"> | null;
	onSave: () => void;
}

export function ItemForm({ item, onSave }: ItemFormProps) {
	const [name, setName] = useState(item?.name || "");
	const [description, setDescription] = useState(item?.description || "");
	const [price, setPrice] = useState(item?.price || 0);
	const [categoryId, setCategoryId] = useState(item?.categoryId || "");
	const [markId, setMarkId] = useState(item?.markId || "");
	const [coverImage, setCoverImage] = useState<Id<"_storage">[]>(item?.coverImage ? [item.coverImage as Id<"_storage">] : []);
	const [gallery, setGallery] = useState<Id<"_storage">[]>(item?.gallery ? (item.gallery as Id<"_storage">[]) : []);
	const [variants, setVariants] = useState(item?.variants || [{ name: "", price: 0 }]);
	const categories = useQuery(api.categories.list, {});
	const marks = useQuery(api.marks.list, {});
	const createItem = useMutation(api.items.create);
	const updateItem = useMutation(api.items.update);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!categoryId || !markId) {
			alert("Please select a category and a mark");
			return;
		}
		const data = {
			name,
			description,
			price,
			categoryId: categoryId as Id<"categories">,
			markId: markId as Id<"marks">,
			gallery: gallery as Id<"_storage">[],
			variants,
			coverImage: coverImage[0] || "",
		};
		if (item) {
			await updateItem({ id: item._id, ...data });
		} else {
			await createItem(data);
		}
		onSave();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="name">Name</Label>
				<Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
			</div>
			<div>
				<Label htmlFor="description">Description</Label>
				<Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
			</div>
			<div>
				<Label htmlFor="price">Price</Label>
				<Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
			</div>
			<FileUpload label="Cover Image" value={coverImage} onChange={setCoverImage} multiple={false} />
			<FileUpload label="Gallery" value={gallery} onChange={setGallery} multiple={true} />
			<div>
				<Label htmlFor="category">Category</Label>
				<Select onValueChange={setCategoryId} value={categoryId}>
					<SelectTrigger>
						<SelectValue placeholder="Select a category" />
					</SelectTrigger>
					<SelectContent>
						{categories?.map((category) => (
							<SelectItem key={category._id} value={category._id}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div>
				<Label htmlFor="mark">Mark</Label>
				<Select onValueChange={setMarkId} value={markId}>
					<SelectTrigger>
						<SelectValue placeholder="Select a mark" />
					</SelectTrigger>
					<SelectContent>
						{marks?.map((mark) => (
							<SelectItem key={mark._id} value={mark._id}>
								{mark.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<Label>Variants</Label>
				{variants.map((variant, index) => (
					<div key={index} className="flex items-center gap-2 mb-2">
						<Input
							placeholder="Variant Name"
							value={variant.name}
							onChange={(e) => {
								const newVariants = [...variants];
								newVariants[index].name = e.target.value;
								setVariants(newVariants);
							}}
						/>
						<Input
							type="number"
							placeholder="Price"
							value={variant.price}
							onChange={(e) => {
								const newVariants = [...variants];
								newVariants[index].price = Number(e.target.value);
								setVariants(newVariants);
							}}
						/>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={() => {
								const newVariants = variants.filter((_, i) => i !== index);
								setVariants(newVariants);
							}}
						>
							Remove
						</Button>
					</div>
				))}
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setVariants([...variants, { name: "", price: 0 }])}
				>
					Add Variant
				</Button>
			</div>

			<Button type="submit">Save</Button>
		</form>
	);
}