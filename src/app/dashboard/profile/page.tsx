"use client";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSchema, type ProfileInput } from "@/schemas";
import { updateProfile } from "@/actions/profile";
import { BackButton } from "@/components/shared/back-button";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: session?.user.name ?? "",
      bio: "",
      image: session?.user.image ?? "",
    },
  });

  const onSubmit = (data: ProfileInput) => {
    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        await update({ name: data.name, image: data.image });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <BackButton href="/dashboard" label="Dashboard" />
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex items-center gap-5 mb-6">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                {session?.user.image ? (
                  <Image src={session.user.image} alt="Avatar" width={80} height={80} className="object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="image">Avatar URL</Label>
                <Input id="image" placeholder="https://..." {...register("image")} />
                {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session?.user.email ?? ""} disabled className="opacity-60" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell others about yourself..." rows={3} {...register("bio")} />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
