import { Button } from "@/components/ui/button";
import { MarkForm } from "@/components/core/admin/mark-form";
import { Modal } from "@/components/ui/modal";
import { api } from "@goldstart/backend/convex/_generated/api";
import type { Doc } from "@goldstart/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export default function AdminMarks() {
	const marks = useQuery(api.marks.list, {});
	const removeMark = useMutation(api.marks.remove);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedMark, setSelectedMark] = useState<Doc<"marks"> | null>(null);

	const handleSave = () => {
		setIsModalOpen(false);
		setSelectedMark(null);
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">Marks</h2>
				<Button onClick={() => setIsModalOpen(true)}>Add Mark</Button>
			</div>
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedMark ? "Edit Mark" : "Add Mark"}>
				<MarkForm mark={selectedMark} onSave={handleSave} />
			</Modal>
			<div className="border rounded-lg">
				<div className="grid grid-cols-2 p-2 font-bold border-b">
					<div>Name</div>
					<div>Actions</div>
				</div>
				{marks?.map((mark) => (
					<div key={mark._id} className="grid grid-cols-2 p-2 border-b">
						<div>{mark.name}</div>
						<div>
							<Button variant="outline" size="sm" className="mr-2" onClick={() => { setSelectedMark(mark); setIsModalOpen(true); }}>Edit</Button>
							<Button variant="destructive" size="sm" onClick={() => removeMark({ id: mark._id })}>
								Delete
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}