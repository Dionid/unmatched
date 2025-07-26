import { usePaasibleApi } from "@/lib/paasible";
import { useDiq } from "@/lib/diq";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from '@uiw/react-color';
import { useEffect, useMemo, useRef } from "react";
import { parse, oklch, formatHex } from 'culori';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";

// Define the schema for your form based on the config collection fields.
const settingsFormSchema = z.object({
  description: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  index_post_columns: z.number().optional(),
  google_analytics_counter: z.string().optional(),
  yandex_metrika_counter: z.string().optional(),
  main_color: z.string().optional(),
  subscribe_button: z.string().optional(),
  bg_image: z.string().optional(),
  collectionId: z.string().optional(),
  logo_url: z.string().optional(),
  ai_seo_turned_on: z.boolean().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const SettingsWidget = () => {
  const api = usePaasibleApi();
  const bgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const user = useMemo(() => {
    return api.pb.authStore.record;
  }, [api.pb.authStore]);

  const getConfigQuery = useDiq(api.Queries.getConfig);
  const updateConfigMutation = useDiq(api.Mutations.updateConfig);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (user?.workspace_id) {
      getConfigQuery.request(user.workspace_id);
    }
  }, [getConfigQuery.request, user]);

  useEffect(() => {
    if (getConfigQuery.data) {
      const parsedData = {
        ...getConfigQuery.data,
        bg_image: getConfigQuery.data.bg_image || undefined
      }
      form.reset(parsedData);
    }
  }, [getConfigQuery.data, form]);

  const handleImageChange = async (file: File, field: string) => {
    if (getConfigQuery.data?.id) {
    const newData = {
      ...form.getValues(),
      [field]: file
    }
    try {
      // Use the PocketBase update method with FormData
      await updateConfigMutation.request(getConfigQuery.data.id, newData);
      toast.success("Настройки успешно сохранены!");
      
      // Refresh the config data
      if (user?.workspace_id) {
        getConfigQuery.request(user.workspace_id);
      }
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error("Ошибка при сохранении настроек");
    }
  }
  }

  const onSubmit = async (data: SettingsFormValues) => {
    if (getConfigQuery.data?.id) {
      try {
        // Use the PocketBase update method with FormData
        await api.pb.collection('config').update(getConfigQuery.data.id, data);
        toast.success("Настройки успешно сохранены!");
        
        // Refresh the config data
        if (user?.workspace_id) {
          getConfigQuery.request(user.workspace_id);
        }
      } catch (error) {
        console.error('Error updating config:', error);
        toast.error("Ошибка при сохранении настроек");
      }
    }
  };

  if (getConfigQuery.isPending) {
    return <div>Загрузка настроек...</div>;
  }

  if (getConfigQuery.error) {
    return <div>Ошибка загрузки настроек: {getConfigQuery.error.message}</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 grid-cols-1 md:grid-cols-2"
      >
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Общее</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        placeholder="Описание"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subscribe_button"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Текст кнопки подписки</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Напишите сюда текст и кнопка появится на сайте"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="index_post_columns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество колонок постов</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(event) =>
                          field.onChange(+event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="logo_url"
                render={() => (
                  <FormItem>
                    <div>
                    <FormLabel>Логотип</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {getConfigQuery.data?.logo_url && (
                          <div
                            className="text-sm text-gray-500 flex mt-4 items-center justify-center"
                          >
                            <img 
                              className="w-full max-h-40 object-cover rounded-md" 
                              src={api.pb.files.getURL(
                                getConfigQuery.data, 
                                getConfigQuery.data.logo_url
                              )} 
                              alt="" 
                            />
                          </div>
                        )}
                        {!getConfigQuery.data?.logo_url && (
                          <div className="w-full h-40 bg-gray-200 mt-4 rounded-md flex items-center justify-center">
                            <p className="text-sm text-gray-500">Логотип не выбран</p>
                          </div>
                        )}
                        <div className="flex justify-center mt-4">
                          <Button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                          >
                            Заменить логотип
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleImageChange(new File([], ""), "logo_url")}
                            className="ml-2"
                          >
                            Удалить логотип
                          </Button>
                        </div>
                        <Input
                          className="hidden"
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageChange(file, "logo_url");
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bg_image"
                render={() => (
                  <FormItem>
                    <div>
                    <FormLabel>Фоновое изображение</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {getConfigQuery.data?.bg_image && (
                          <div
                            className="text-sm text-gray-500 flex mt-4 items-center justify-center"
                          >
                            <img 
                              className="w-full max-h-40 object-cover rounded-md" 
                              src={api.pb.files.getURL(
                                getConfigQuery.data, 
                                getConfigQuery.data.bg_image
                              )} 
                              alt="" 
                            />
                          </div>
                        )}
                        {!getConfigQuery.data?.bg_image && (
                          <div className="w-full h-40 bg-gray-200 mt-4 rounded-md flex items-center justify-center">
                            <p className="text-sm text-gray-500">Фоновое изображение не выбрано</p>
                          </div>
                        )}
                        <div className="flex justify-center mt-4">
                          <Button
                            type="button"
                            onClick={() => bgInputRef.current?.click()}
                          >
                            Заменить изображение
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleImageChange(new File([], ""), "bg_image")}
                            className="ml-2"
                          >
                            Удалить изображение
                          </Button>
                        </div>
                        <Input
                          className="hidden"
                          ref={bgInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageChange(file, "bg_image");
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              </div>
              <FormField
                control={form.control}
                name="main_color"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>Основной цвет</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2 mt-2">
                        <Chrome
                          color={formatHex(parse(`oklch(${form.getValues("main_color") })`))}
                          showTriangle={false}
                          style={{
                            width: '100% !important',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            boxShadow: 'none',
                          }}
                          onChange={(color) => {
                            // Step 1: Parse HEX into internal RGB object
                            const parsedColor = parse(color.hex);
                            const oklchColor = oklch(parsedColor);
                            field.onChange(
                              oklchColor?.l.toFixed(4) +
                              " " +
                              oklchColor?.c.toFixed(4) +
                              " " +
                              (oklchColor?.h?.toFixed(4) || "0")
                            );
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={
                updateConfigMutation.isPending || !form.formState.isDirty
              }
              className="mt-8"
            >
              {updateConfigMutation.isPending
                ? "Сохранение..."
                : "Сохранить изменения"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="seo_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO заголовок</FormLabel>
                    <FormControl>
                      <Input placeholder="SEO заголовок" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seo_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO описание</FormLabel>
                    <FormControl>
                      <Textarea placeholder="SEO описание" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ai_seo_turned_on"
                render={({ field }) => (
                  <div>
                    <div className="flex items-center gap-4">
                      <FormLabel>Включить AI SEO</FormLabel>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-4">AI будет ежедневно добавлять SEO-оптимизированные заголовки, описания и ключевые слова для постов для всех постов</p>
                  </div>
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={
                updateConfigMutation.isPending || !form.formState.isDirty
              }
              className="mt-8"
            >
              {updateConfigMutation.isPending
                ? "Сохранение..."
                : "Сохранить изменения"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Аналитика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="google_analytics_counter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Счетчик Google Analytics</FormLabel>
                    <FormControl>
                      <Input placeholder="UA-XXXXX-Y" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yandex_metrika_counter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Счетчик Яндекс.Метрики</FormLabel>
                    <FormControl>
                      <Input placeholder="XXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={
                updateConfigMutation.isPending || !form.formState.isDirty
              }
              className="mt-8"
            >
              {updateConfigMutation.isPending
                ? "Сохранение..."
                : "Сохранить изменения"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};
