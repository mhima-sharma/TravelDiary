"use client";
import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordSchema } from "@/schemas";
import type { z } from "zod";
import { forgotPassword } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = (data: z.infer<typeof ForgotPasswordSchema>) => {
    startTransition(async () => {
      const result = await forgotPassword(data);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send Reset Link"}
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/login"><ArrowLeft className="mr-2 h-4 w-4" />Back to Login</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
