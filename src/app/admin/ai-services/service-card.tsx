"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateApiService, reenableApiService } from "@/actions/ai-admin";
import type { ApiService } from "@prisma/client";

const STATUS_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  ONLINE: "success",
  DEGRADED: "warning",
  OFFLINE: "destructive",
  UNKNOWN: "secondary",
};

interface ServiceUsage {
  todayTotal: number;
  todaySuccess: number;
  todayFailed: number;
  monthTotal: number;
  monthFailed: number;
}

export function ServiceCard({ service, usage }: { service: ApiService; usage: ServiceUsage }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(service.enabled);
  const [dailyLimit, setDailyLimit] = useState(service.dailyLimit?.toString() ?? "");
  const [monthlyLimit, setMonthlyLimit] = useState(service.monthlyLimit?.toString() ?? "");
  const [warningThresholdPct, setWarningThresholdPct] = useState(service.warningThresholdPct);
  const [maintenanceMessage, setMaintenanceMessage] = useState(service.maintenanceMessage ?? "");

  function handleSave() {
    startTransition(async () => {
      const result = await updateApiService(service.key, {
        enabled,
        dailyLimit: dailyLimit ? Number(dailyLimit) : null,
        monthlyLimit: monthlyLimit ? Number(monthlyLimit) : null,
        warningThresholdPct,
        maintenanceMessage: maintenanceMessage || null,
      });
      if ("error" in result) toast.error(result.error);
      else {
        toast.success(`${service.name} updated`);
        router.refresh();
      }
    });
  }

  function handleReenable() {
    startTransition(async () => {
      await reenableApiService(service.key);
      toast.success(`${service.name} re-enabled`);
      router.refresh();
    });
  }

  const remainingDaily = service.dailyLimit != null ? Math.max(service.dailyLimit - usage.todayTotal, 0) : null;
  const remainingMonthly = service.monthlyLimit != null ? Math.max(service.monthlyLimit - usage.monthTotal, 0) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{service.name}</CardTitle>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[service.status] ?? "secondary"}>{service.status}</Badge>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {service.autoDisabled && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Auto-disabled ({service.autoDisabledCause})</p>
              {service.autoDisabledReason && (
                <p className="text-muted-foreground mt-0.5">{service.autoDisabledReason}</p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={handleReenable} disabled={isPending}>
              Re-enable
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Today</p>
            <p>
              {usage.todaySuccess} ok / {usage.todayFailed} failed
              {remainingDaily != null ? ` / ${remainingDaily} left` : ""}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">This Month</p>
            <p>
              {usage.monthTotal - usage.monthFailed} ok / {usage.monthFailed} failed
              {remainingMonthly != null ? ` / ${remainingMonthly} left` : ""}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Success</p>
            <p>{service.lastSuccessAt ? new Date(service.lastSuccessAt).toLocaleString() : "Never"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Error</p>
            <p>{service.lastErrorAt ? new Date(service.lastErrorAt).toLocaleString() : "None"}</p>
          </div>
        </div>
        {service.lastError && <p className="text-xs text-destructive line-clamp-2">{service.lastError}</p>}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Daily Limit</Label>
            <Input
              type="number"
              min={1}
              placeholder="Unlimited"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Monthly Limit</Label>
            <Input
              type="number"
              min={1}
              placeholder="Unlimited"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
            />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Warning Threshold %</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={warningThresholdPct}
              onChange={(e) => setWarningThresholdPct(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Maintenance Message</Label>
          <Textarea
            rows={2}
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="Shown to users when this service is unavailable"
          />
        </div>

        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
