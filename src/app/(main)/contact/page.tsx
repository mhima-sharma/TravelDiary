"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Mail, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitContact } from "@/actions/contact";

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    startTransition(async () => {
      const result = await submitContact(data);
      if (result.success) {
        toast.success(result.success);
        form.reset();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-muted-foreground text-lg">Have a question, suggestion, or issue? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          {[
            { icon: Mail, title: "Email", value: "hello@traveldiary.com" },
            { icon: MapPin, title: "Location", value: "India" },
            { icon: MessageSquare, title: "Response Time", value: "Within 24 hours" },
          ].map(({ icon: Icon, title, value }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg mt-1">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Send a Message</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required placeholder="Your name" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required placeholder="What's this about?" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={5} placeholder="Tell us more..." />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
