"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAiSettings, clearItineraryCache } from "@/actions/ai-admin";
import type { AiSettings } from "@prisma/client";

export function GlobalSettingsForm({ settings }: { settings: AiSettings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tripPlannerEnabled, setTripPlannerEnabled] = useState(settings.tripPlannerEnabled);
  const [chatbotEnabled, setChatbotEnabled] = useState(settings.chatbotEnabled);
  const [unavailableMessage, setUnavailableMessage] = useState(settings.unavailableMessage);
  const [cacheEnabled, setCacheEnabled] = useState(settings.cacheEnabled);
  const [cacheDurationDays, setCacheDurationDays] = useState(settings.cacheDurationDays);

  function handleSave() {
    startTransition(async () => {
      const result = await updateAiSettings({
        tripPlannerEnabled,
        chatbotEnabled,
        unavailableMessage,
        cacheEnabled,
        cacheDurationDays,
      });
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Settings updated");
        router.refresh();
      }
    });
  }

  function handleClearCache() {
    if (!confirm("Clear all cached itineraries? This can't be undone.")) return;
    startTransition(async () => {
      await clearItineraryCache();
      toast.success("Cache cleared");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>AI Trip Planner</Label>
            <p className="text-xs text-muted-foreground">Master toggle for the trip planner feature</p>
          </div>
          <Switch checked={tripPlannerEnabled} onCheckedChange={setTripPlannerEnabled} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Chatbot Widget</Label>
            <p className="text-xs text-muted-foreground">Show or hide the floating chatbot for all users</p>
          </div>
          <Switch checked={chatbotEnabled} onCheckedChange={setChatbotEnabled} />
        </div>

        <div className="space-y-2">
          <Label>Unavailable Message</Label>
          <Textarea
            value={unavailableMessage}
            onChange={(e) => setUnavailableMessage(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Response Cache</Label>
            <p className="text-xs text-muted-foreground">Cache Gemini responses for similar trip prompts</p>
          </div>
          <Switch checked={cacheEnabled} onCheckedChange={setCacheEnabled} />
        </div>

        <div className="space-y-2 max-w-xs">
          <Label>Cache Duration (days)</Label>
          <Input
            type="number"
            min={1}
            max={365}
            value={cacheDurationDays}
            onChange={(e) => setCacheDurationDays(Number(e.target.value))}
          />
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
          <Button variant="destructive" onClick={handleClearCache} disabled={isPending}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
