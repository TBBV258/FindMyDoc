import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { documentTypes } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { canUploadPremiumDocument } from "@/lib/subscription";

const documentSchema = z.object({
  type: z.string().min(1, { message: "Document type is required" }),
  name: z.string().min(2, { message: "Document name is required" }),
  documentNumber: z.string().min(2, { message: "Document number is required" }),
  description: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  onSubmit: (data: DocumentFormValues) => Promise<void>;
  defaultValues?: Partial<DocumentFormValues>;
}

export function DocumentForm({ onSubmit, defaultValues }: DocumentFormProps) {
  const { user, isDemo } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: defaultValues || {
      type: "",
      name: "",
      documentNumber: "",
      description: "",
    },
  });

  const handleSubmit = async (data: DocumentFormValues) => {
    const selectedType = documentTypes.find(type => type.id === data.type);
    
    // Check if user can upload premium document
    if (selectedType?.isPremium && user && !canUploadPremiumDocument(user)) {
      toast({
        title: "Subscription Required",
        description: "You need a premium subscription to upload this type of document.",
        variant: "destructive",
      });
      return;
    }

    // Check if it's a demo account with limited uploads
    if (isDemo && form.getValues("type") !== "id_card") {
      toast({
        title: "Demo Restriction",
        description: "Demo accounts can only upload ID cards.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="border border-mediumGray rounded-lg focus:ring-primary">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} {type.isPremium && "(Premium)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. National ID Card"
                  {...field}
                  disabled={isLoading}
                  className="border border-mediumGray rounded-lg focus:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 12345678910Z"
                  {...field}
                  disabled={isLoading}
                  className="border border-mediumGray rounded-lg focus:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add additional details about your document"
                  {...field}
                  disabled={isLoading}
                  className="border border-mediumGray rounded-lg focus:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-3 mt-6 rounded-lg font-medium hover:bg-primary/90 transition"
        >
          {isLoading ? "Saving..." : "Save Document"}
        </Button>
      </form>
    </Form>
  );
}
