"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResetPasswordSchema } from "@/schemas";
import { changePassword } from "@/actions/profile";
import { BackButton } from "@/components/shared/back-button";
import type { z } from "zod";

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = (data: z.infer<typeof ResetPasswordSchema>) => {
    startTransition(async () => {
      const result = await changePassword(data);
      if (result.error) toast.error(result.error);
      else { toast.success(result.success); reset(); }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <BackButton href="/dashboard" label="Dashboard" />
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>New Password</Label>
              <Input type="password" placeholder="Min. 8 characters" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="Repeat password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
