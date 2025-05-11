import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/language';
import { useAuth } from '@/lib/auth';
import { documentTypes } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HintBox } from '@/components/ui/hint-box';
import { AlertTriangle, ImagePlus, MapPin } from 'lucide-react';

// Define form schema
const formSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  documentNumber: z.string().min(1, "Document number is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  lostLocation: z.string().min(3, "Lost location is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportLostDocumentForm({
  onSuccess = () => {},
  onCancel = () => {},
}) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: '',
      documentNumber: '',
      name: '',
      lostLocation: '',
      description: '',
      imageUrl: '',
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('common.error'),
        description: t('document.imageTooLarge'),
        variant: "destructive",
      });
      return;
    }

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Replace with actual image upload
    setIsUploading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would upload to storage
      // and get back the URL to store in the form
      const mockImageUrl = URL.createObjectURL(file);
      form.setValue('imageUrl', mockImageUrl);
      
      setIsUploading(false);
      toast({
        title: t('document.imageUploaded'),
        description: t('document.imageUploadedDesc'),
      });
    } catch (error) {
      setIsUploading(false);
      toast({
        title: t('common.error'),
        description: t('document.imageUploadError'),
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: t('common.loginRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Create document and mark it as lost
      const documentData = JSON.stringify({
        type: data.documentType,
        documentNumber: data.documentNumber,
        name: data.name,
        status: 'lost',
        description: data.description,
        imageUrl: data.imageUrl,
        userId: user.id,
      });

      const createdDoc = await apiRequest('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: documentData,
      });

      // Create lost document report with location
      const lostDocData = JSON.stringify({
        documentId: createdDoc.id,
        userId: user.id,
        lostLocation: data.lostLocation,
        description: data.description,
        lostAt: new Date().toISOString(),
      });

      await apiRequest('/api/lost-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: lostDocData,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lost-documents'] });

      toast({
        title: t('document.reportSubmitted'),
        description: t('document.reportSubmittedDesc'),
      });

      onSuccess();
    } catch (error) {
      console.error('Error reporting lost document:', error);
      toast({
        title: t('common.error'),
        description: t('document.reportError'),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('document.reportLost')}</CardTitle>
      </CardHeader>
      <CardContent>
        <HintBox 
          title={t('document.reportTip')} 
          hintKey="lost-document-form"
        >
          {t('document.reportHint')}
        </HintBox>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('document.type')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="input-minimalist">
                        <SelectValue placeholder={t('document.selectType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
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
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('document.documentNumber')}</FormLabel>
                  <FormControl>
                    <Input 
                      className="input-minimalist" 
                      {...field} 
                      placeholder={t('document.enterDocumentNumber')} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('document.nameOnDocument')}</FormLabel>
                  <FormControl>
                    <Input 
                      className="input-minimalist" 
                      {...field} 
                      placeholder={t('document.enterName')} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lostLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('document.lostLocation')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        className="input-minimalist pl-9" 
                        {...field} 
                        placeholder={t('document.enterLocation')} 
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t('document.locationDesc')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('document.additionalDetails')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="input-minimalist resize-none" 
                      {...field} 
                      placeholder={t('document.enterDetails')} 
                    />
                  </FormControl>
                  <FormDescription>
                    {t('document.detailsDesc')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>{t('document.uploadImage')}</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-md p-6 relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img 
                        src={imagePreview} 
                        alt="Document preview" 
                        className="w-full h-auto rounded-md object-cover max-h-48"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 hover:opacity-100 transition-opacity rounded-md">
                        <p className="text-sm">{t('document.changeImage')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">{t('document.dragOrClick')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('document.imageRestrictions')}
                      </p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                {t('document.imageRecommendation')}
              </FormDescription>
            </FormItem>

            <div className="bg-warning/10 p-3 rounded-md flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {t('document.privacyWarning')}
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isUploading || form.formState.isSubmitting}
        >
          {isUploading || form.formState.isSubmitting 
            ? t('common.submitting') 
            : t('document.submitReport')}
        </Button>
      </CardFooter>
    </Card>
  );
}