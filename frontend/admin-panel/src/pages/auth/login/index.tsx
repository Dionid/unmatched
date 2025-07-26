import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDiq } from "@/lib/diq";
import { usePaasibleApi } from "@/lib/paasible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { mergeErrors } from "@/lib/rhf";
import { useNavigate } from "react-router";

const formSchema = z.object({
  username: z.string().min(1).refine((val) => !val.includes('@'), {
    message: "Нельзя использовать @ в никнейме"
  }),
  password: z.string().min(8),
});

type LoginFormProps = React.ComponentProps<"div"> & {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  onFormSubmit: (values: z.infer<typeof formSchema>) => void;
};

export function LoginForm({
  className,
  onFormSubmit,
  form,
  ...props
}: LoginFormProps) {
  const navigate = useNavigate();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden py-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className="p-6 md:p-8"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Вход</h1>
                  {/* <p className="text-balance text-muted-foreground">
                    Your admin must give you login and password
                  </p> */}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">
                    Ваш никнейм в telegram (без @)
                  </Label>
                  <Input
                    id="username"
                    type="username"
                    placeholder="username"
                    required
                    {...form.register("username")}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Пароль</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    {...form.register("password")}
                  />
                </div>
                {mergeErrors(form) != "" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{mergeErrors(form)}</AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full">
                    Войти
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/auth/signup");
                    }}
                  >
                    Регистрация
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Если вы забыли пароль, напишите в поддержку{" "}
                  <a
                    href={"https://t.me/teleblog_robot?start=/verify"}
                    target="_blank"
                    className="c-link border-b-2 border-b-blue-400 border-dashed transition-colors"
                  >
                    @teleblog_robot
                  </a>
                </p>
              </div>
            </form>
          </Form>
          {/* <div className="relative hidden bg-muted md:block">
            <img
              src="/public/image2.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale"
            />
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

export const LoginPage = () => {
  const api = usePaasibleApi();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const signInMutation = useDiq(api.Mutations.signIn);

  const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await signInMutation.request(values);
    if (result instanceof Error) {
      form.setError("root", {
        type: "manual",
        message: result.message,
      });
      return;
    }
    if (api.pb.authStore.isValid) {
      // Redirect to the app page after successful login
      window.location.href = "/app";
    }
    form.reset();
    form.clearErrors();
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm form={form} onFormSubmit={onFormSubmit} />
      </div>
    </div>
  );
};
