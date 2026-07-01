"use client";
import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RedemptionSchema } from "@/schemas";
import { redeemReward } from "@/actions/rewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CountrySelect } from "@/components/location/country-select";
import { StateSelect } from "@/components/location/state-select";
import { CitySelect } from "@/components/location/city-select";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2, MapPin, User, Package } from "lucide-react";

type FormValues = z.infer<typeof RedemptionSchema>;

type Props = {
  reward: { id: string; name: string; icon: string; coinCost: number };
  userCoins: number;
  userEmail: string;
  onSuccess?: () => void;
};

const STEPS = [
  { title: "Personal Info",    icon: User },
  { title: "Delivery Address", icon: MapPin },
  { title: "Review & Confirm", icon: Package },
];

export function RedemptionForm({ reward, userCoins, userEmail, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(RedemptionSchema),
    defaultValues: {
      rewardId: reward.id,
      email: userEmail,
      country: "India",
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue, control } = form;
  const values = watch();

  const step0Fields: (keyof FormValues)[] = ["fullName", "email", "phone"];
  const step1Fields: (keyof FormValues)[] = ["streetAddress", "city", "state", "country", "postalCode"];

  async function nextStep() {
    const fields = step === 0 ? step0Fields : step1Fields;
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  }

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      const result = await redeemReward(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        onSuccess?.();
      }
    });
  }

  const remaining = userCoins - reward.coinCost;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("rewardId")} />

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-0 mb-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              i === step ? "bg-primary text-primary-foreground" :
              i < step ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{s.title}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-px w-4 ${i < step ? "bg-green-400" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Personal Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" {...register("fullName")} placeholder="Your full name" />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} placeholder="your@email.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Mobile Number *</Label>
            <Input id="phone" {...register("phone")} placeholder="+91 98765 43210" />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
        </div>
      )}

      {/* Step 1: Delivery Address */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="houseNumber">House / Flat No.</Label>
              <Input id="houseNumber" {...register("houseNumber")} placeholder="A-101" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="area">Area / Locality</Label>
              <Input id="area" {...register("area")} placeholder="Your locality" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input id="streetAddress" {...register("streetAddress")} placeholder="123, Main Street" />
            {errors.streetAddress && <p className="text-xs text-destructive">{errors.streetAddress.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="landmark">Landmark (optional)</Label>
            <Input id="landmark" {...register("landmark")} placeholder="Near XYZ School" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="country">Country *</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <CountrySelect
                  id="country"
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    setValue("state", "");
                    setValue("city", "");
                  }}
                />
              )}
            />
            {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="state">State *</Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <StateSelect
                    id="state"
                    country={values.country}
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      setValue("city", "");
                    }}
                  />
                )}
              />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="district">District</Label>
              <Input id="district" {...register("district")} placeholder="Your district" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="city">City *</Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <CitySelect id="city" country={values.country} state={values.state} value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input id="postalCode" {...register("postalCode")} placeholder="400001" />
              {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="deliveryInstructions">Special Instructions (optional)</Label>
            <Textarea id="deliveryInstructions" {...register("deliveryInstructions")} placeholder="Any special delivery instructions..." rows={2} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="preferredDeliveryTime">Preferred Delivery Time (optional)</Label>
            <Input id="preferredDeliveryTime" {...register("preferredDeliveryTime")} placeholder="e.g. Weekday mornings" />
          </div>
        </div>
      )}

      {/* Step 2: Review & Confirm */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="bg-muted/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reward</span>
                <span className="font-medium">{reward.icon} {reward.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coins Required</span>
                <span className="font-medium text-amber-600">{reward.coinCost.toLocaleString()} 🪙</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Coins</span>
                <span className="font-medium">{userCoins.toLocaleString()} 🪙</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Remaining After</span>
                <span className={remaining < 0 ? "text-destructive" : "text-green-600"}>{remaining.toLocaleString()} 🪙</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Shipping To</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">{values.fullName}</p>
              <p>{values.phone} · {values.email}</p>
              <p>
                {[values.houseNumber, values.streetAddress].filter(Boolean).join(", ")}
                {values.landmark && `, Near ${values.landmark}`}
              </p>
              <p>
                {[values.area, values.city, values.district, values.state, values.postalCode]
                  .filter(Boolean).join(", ")}
              </p>
              <p>{values.country}</p>
              {values.deliveryInstructions && (
                <p className="italic mt-1">"{values.deliveryInstructions}"</p>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            By confirming, {reward.coinCost.toLocaleString()} coins will be deducted from your balance. This action cannot be undone.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        ) : <div />}

        {step < 2 ? (
          <Button type="button" onClick={nextStep}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending || remaining < 0} className="bg-green-600 hover:bg-green-700">
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : "🌱 Confirm Redemption"}
          </Button>
        )}
      </div>
    </form>
  );
}
