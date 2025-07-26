import { Card, CardContent } from "@/components/ui/card";
import { useDiq } from "@/lib/diq";
import { usePaasibleApi } from "@/lib/paasible";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const domainFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Название должно быть не менее 3 символов" }),
  seo_hidden: z.boolean().optional(),
  is_certified: z.boolean().optional(),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;

export const DomainWidget = ({ config_id }: { config_id: string }) => {
  const api = usePaasibleApi();

  const user = useMemo(() => {
    return api.pb.authStore.record;
  }, [api.pb.authStore]);

  const getDomainsQuery = useDiq(api.Queries.getDomains);
  const createDomainMutation = useDiq(api.Mutations.createDomain);
  const updateDomainMutation = useDiq(api.Mutations.updateDomain);
  const deleteDomainMutation = useDiq(api.Mutations.deleteDomain);

  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      name: "",
      seo_hidden: false,
    },
  });

  const setSslCertMutation = useDiq(api.Mutations.setSslCert);

  useEffect(() => {
    if (user) {
      getDomainsQuery.request(user.workspace_id, 1, 10);
    }
  }, [getDomainsQuery.request, user]);

  const handleSeoHiddenChange = async (
    domainId: string,
    newSeoHiddenState: boolean
  ) => {
    if (!user) return;
    try {
      const response = await updateDomainMutation.request(domainId, {
        seo_hidden: newSeoHiddenState,
      });
      if (response instanceof Error) {
        toast.error(response.message);
        return;
      }
      toast.success("Настройки домена обновлены");
      getDomainsQuery.request(user.workspace_id, 1, 10);
    } catch (error: unknown | Error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Произошла ошибка при обновлении домена");
      }
    }
  };

  const handleSetSslCert = async (domainName: string) => {
    if (!user) return;

    const response = await setSslCertMutation.request(domainName);
    if (response instanceof Error) {
      toast.error(response.message);
      return;
    }

    if (response.status === "error") {
      toast.error(response.message);
      return;
    }

    toast.success("Сертификат успешно выпущен");
    getDomainsQuery.request(user.workspace_id, 1, 10);
  };

  const onSubmit = async (data: DomainFormValues) => {
    if (!user) return;
    try {
      const response = await createDomainMutation.request({
        name: data.name,
        config_id: config_id,
        seo_hidden: data.seo_hidden || false,
      });
      if (response instanceof Error) {
        toast.error(response.message);
        return;
      }
      toast.success("Домен успешно создан");
      getDomainsQuery.request(user.workspace_id, 1, 10);
      form.reset();
    } catch (error: unknown | Error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Произошла ошибка при создании домена");
      }
    }
  };

  const deleteDomain = async (domainId: string) => {
    if (!user) return;
    try {
      const response = await deleteDomainMutation.request(domainId);
      if (response instanceof Error) {
        toast.error(response.message);
        return;
      }
      toast.success("Домен успешно удален");
      getDomainsQuery.request(user.workspace_id, 1, 10);
      form.reset();
    } catch (error: unknown | Error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Произошла ошибка при создании домена");
      }
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <div className="rounded-md border bg-white w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="p-4">Домен</TableHead>
                <TableHead className="p-4 hidden">Скрыт от SEO</TableHead>
                <TableHead className="p-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getDomainsQuery.data?.items.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="p-4 py-2 ">
                    <a
                      className="font-mono border-b-1 border-b-blue-400 border-dashed transition-colors"
                      href={`https://${domain.name}`}
                      target="_blank"
                    >
                      {domain.name}
                    </a>
                  </TableCell>
                  <TableCell className="p-4 py-2 hidden">
                    <input
                      type="checkbox"
                      checked={domain.seo_hidden}
                      disabled={updateDomainMutation.isPending}
                      onChange={(e) =>
                        handleSeoHiddenChange(domain.id, e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="p-4 py-2 ">
                    {domain.is_certified ? (
                      <span className="text-green-500">Сертифицирован</span>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleSetSslCert(domain.name)}
                        disabled={setSslCertMutation.isPending}
                      >
                        {setSslCertMutation.isPending
                          ? "Выпускается..."
                          : "Выпустить сертификат"}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="p-4 py-2 ">
                    <Button
                      variant="outline"
                      onClick={() => deleteDomain(domain.id)}
                      disabled={deleteDomainMutation.isPending}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {getDomainsQuery.isPending && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Загрузка...
                  </TableCell>
                </TableRow>
              )}
              {getDomainsQuery.error && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-red-500">
                    Ошибка при загрузке доменов
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Card className="w-md rounded-md shadow-none">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
              >
                <h3 className="text-lg font-semibold mb-4">Добавить домен</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo_hidden"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 p-2 hidden">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <label className="text-sm">Скрыть от SEO</label>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createDomainMutation.isPending}>
                  {createDomainMutation.isPending
                    ? "Добавление..."
                    : "Добавить"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
