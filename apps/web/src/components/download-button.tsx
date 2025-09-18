import { Button } from "./ui/button";
import { useQuery } from "convex/react";
import { api } from "@goldstart/backend/convex/_generated/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01FreeIcons } from "@hugeicons/core-free-icons";

export function DownloadButton() {
    const items = useQuery(api.items.list, {});

    const handleDownload = () => {
        if (!items) {
            return;
        }

        const doc = new jsPDF();
        doc.text("GoldStar", 14, 15);
        const headers = [["Item Name", "Item Description", "Variant Name", "Variant Price"]];
        const rows = items.flatMap((item) => {
            if (item.variants && item.variants.length > 0) {
                return item.variants.map((variant) => [
                    item.name,
                    item.description || "",
                    variant.name,
                    variant.price.toFixed(2),
                ]);
            } else {
                return [
                    [
                        item.name,
                        item.description || "",
                        "",
                        "",
                    ],
                ];
            }
        });

        doc.autoTable({
            head: headers,
            body: rows,
        });

        doc.save("items.pdf");
    };

    return (
        <div className="fixed bottom-4 right-4">
            <Button className="bg-primary/10 rounded-xl text-primary items-center flex gap-3 " onClick={handleDownload} disabled={!items}>
                <div className="">Download PDF</div>
                <HugeiconsIcon icon={Download01FreeIcons} className="h-4 w-4 " />

            </Button>
        </div>
    );
}