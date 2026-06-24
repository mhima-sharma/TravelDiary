"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitReport } from "@/actions/places";

const REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "INCORRECT_INFO", label: "Incorrect information" },
  { value: "DUPLICATE", label: "Duplicate listing" },
  { value: "OTHER", label: "Other" },
];

export function ReportButton({ placeId }: { placeId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    setLoading(true);
    const result = await submitReport(placeId, reason, details || undefined);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      setOpen(false);
      setReason("");
      setDetails("");
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
        title="Report this place"
      >
        <Flag className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this place</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Additional details (optional)</Label>
              <Textarea
                placeholder="Describe the issue..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
