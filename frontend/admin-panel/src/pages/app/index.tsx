import { Toaster } from "sonner";
import { useNavigate } from "react-router";
import { usePaasibleApi } from "@/lib/paasible";
import { useDiq } from "@/lib/diq";
import { useCallback, useEffect, useMemo } from "react";
import { ClientResponseError } from "pocketbase";
import { UploadHistoryWidget } from "./widgets/upload-history";
import { Button } from "@/components/ui/button";
import { SettingsWidget } from "./widgets/settings";
import { EntityTableWidget } from "@/components/widgets/EntityTableWidget";
import { DomainWidget } from "./widgets/domain";

export const AppLayout = () => {
  const navigate = useNavigate();
  const api = usePaasibleApi();

  useEffect(() => {
    if (!api.pb.authStore.record) {
      navigate("/auth/signin");

      return;
    }
  }, [api.pb.authStore.record, navigate]);

  const user = useMemo(() => {
    return api.pb.authStore.record;
  }, [api.pb.authStore]);

  const getTgTokenQuery = useDiq(api.Queries.getTgToken);
  const getConfigQuery = useDiq(api.Queries.getConfig);
  const getPostsQuery = useDiq(api.Queries.getPosts);
  const getCommentsQuery = useDiq(api.Queries.getComments);
  // const getDomainsQuery = useDiq(api.Queries.getDomains);

  useEffect(() => {
    if (user) {
      getTgTokenQuery.request(user.id);
      getConfigQuery.request(user.workspace_id);
      getPostsQuery.request(user.workspace_id, 1, 10);
      getCommentsQuery.request(user.workspace_id, 1, 10);
      // getDomainsQuery.request(user.workspace_id, 1, 10);
    }
  }, [getTgTokenQuery.request, getConfigQuery.request, user]);

  const onUploadSuccess = useCallback(() => {
    if (user) {
      getPostsQuery.request(user.workspace_id, 1, 10);
      getCommentsQuery.request(user.workspace_id, 1, 10);
    }
  }, [getPostsQuery.request, getCommentsQuery.request, user]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">User not found</div>
      </div>
    );
  }

  if (getTgTokenQuery.isPending || getConfigQuery.isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (getTgTokenQuery.error) {
    const error = getTgTokenQuery.error;
    if (error.message.includes("wasn't found")) {
      api.pb.authStore.clear();
      navigate("/auth");

      return;
    }

    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">{error.message}</div>
      </div>
    );
  }

  if (getTgTokenQuery.data && getTgTokenQuery.data.verified === false) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              1/2. Верификация аккаунта
            </h2>
            <p className="mb-4">
              Чтобы подтвердить свой аккаунт в Telegram, отправьте
              следующее сообщение боту{" "}
              <a
                href={"https://t.me/teleblog_net_bot?start=/verify"}
                target="_blank"
                className="c-link border-b-2 border-b-blue-400 border-dashed transition-colors"
              >
                @teleblog_net_bot
              </a>{" "}
              (не перепутайте с ботом поддержки) и после этого перезагрузите страницу:
            </p>
            <p className="p-6 bg-gray-200 rounded-md">
              /verifytoken {getTgTokenQuery.data.value}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (getConfigQuery.error) {
    if (
      getConfigQuery.error instanceof ClientResponseError &&
      getConfigQuery.error.status === 404
    ) {
      return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                2/2. Добавление канала
              </h2>
              <p className="mb-4">
                Добавьте бота{" "}
                <a
                  href={"https://t.me/teleblog_net_bot"}
                  target="_blank"
                  className="c-link border-b-2 border-b-blue-400 border-dashed transition-colors"
                >
                  @teleblog_net_bot
                </a>{" "}
                в <b>ваш канал и чат канала</b> (при его наличии), как администратора
                без каких-либо прав, после чего отправьте ему следующую команду и затем
                снова перезагрузите эту страницу:
              </p>
              <p className="p-6 bg-gray-200 rounded-md">
                /addchannel ссылка_на_ваш_канал
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-red-500">
            {getConfigQuery.error.message ||
              "Произошла ошибка при получении конфигурации."}
          </div>
        </div>
      );
    }
  }

  if (getPostsQuery.isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // # Last step: show success message
  return (
    <>
      <Toaster />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-100">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold mb-10">teleblog.net / Личный кабинет</h2>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <a
                  target="_blank"
                  href="https://valeronich.notion.site/teleblog-net-23269d14d077802eb7f3f74ca25c8b63"
                >
                  База знаний
                </a>
              </Button>
              <Button onClick={() => api.pb.authStore.clear()}>Выйти</Button>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-6">
            {getConfigQuery.data && (
              <div className="flex flex-col gap-2">
                <div className="text-2xl px-6 font-bold">Домены</div>
                <div className=" text-gray-600 px-6">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Введите ваш домен в поле «Добавить домен» и нажмите кнопку "Добавить".</li>
                    <li>
                      Добавьте А запись 82.97.250.194 для вашего домена на DNS
                      сервере
                      В личном кабинете вашего доменного регистратора перейдите в раздел управления DNS и создайте A‑запись со значением "82.97.250.194".
                    </li>
                    <li>Далее нажмите на кнопку "Выпустить сертификат".</li>
                  </ol>
                </div>
                <div className="mt-6">
                  <DomainWidget config_id={getConfigQuery.data?.id} />
                </div>
              </div>
            )}
            <div className="px-6 mt-4">
              <div className="text-2xl font-bold text-gray-800">
                Загрузка истории постов канала 
              </div>
              <div className=" text-gray-600 mt-2">
                <p>Если вы хотите загрузить историю канала или чата канала:</p>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  <li>
                    Экспортируйте из telegram историю канала и чата (при его наличии) в формате JSON.
                  </li>
                  <li>
                    Создайте из полученной выгрузки архив в формате ZIP и загрузите его в форму ниже.
                  </li>
                  <li>При наличии чата канала повторите процедуру для загрузки комментариев к постам.</li>
                </ol>
              </div>
            </div>
            <UploadHistoryWidget onSuccess={onUploadSuccess} />
            <div className="text-2xl px-6 font-bold mt-6">Настройки сайта</div>
            <SettingsWidget />
            <div className="text-2xl px-6 font-bold mt-6">Каналы</div>
            <div className=" text-gray-600 px-6">
              Чтобы добавить канал и чат канала в ваш телеблог:
              <ol className="list-decimal list-inside space-y-2 mt-4">
                <li>
                  Добавьте бота{" "}
                  <a
                    href={"https://t.me/teleblog_net_bot"}
                    target="_blank"
                    className="c-link border-b-2 border-b-blue-400 border-dashed transition-colors"
                  >
                    @teleblog_net_bot
                  </a>{" "}
                  в <b>ваш канал и чат канала</b> (при его наличии), как администратора
                  без каких-либо прав.
                </li>
                <li>
                  Отправьте ему следующую команду:{" "}
                  <span className="font-mono">
                    `/addchannel ссылка_на_ваш_канал`
                  </span>
                </li>
              </ol>
            </div>
            {getConfigQuery.data && (
              <EntityTableWidget
                collectionName="chat"
                displayColumns={["tg_username", "tg_chat_id", "tg_type"]}
                columnNames={{
                  tg_username: "Название",
                  tg_chat_id: "ID в телеграме",
                  tg_type: "Тип",
                }}
                collectionOptions={{
                  sort: "-created",
                  filter: `config_id = "${getConfigQuery.data.id}"`,
                }}
                searchableColumns={["tg_username"]}
                columnTransformers={{
                  tg_type: (type) => {
                    switch (type) {
                      case "channel":
                        return "Канал";
                      case "group":
                      case "supergroup":
                        return "Дискуссия";
                      default:
                        return type;
                    }
                  },
                }}
              />
            )}
            <div className="text-2xl px-6 font-bold mt-6">Посты</div>
            <EntityTableWidget
              collectionName="post"
              displayColumns={["id", "slug", "text"]}
              columnNames={{
                slug: "Ссылка",
                text: "Текст",
                id: "ID",
              }}
              columnTransformers={{
                text: (text) => {
                  return text.length > 100 ? text.slice(0, 100) + "..." : text;
                },
              }}
              collectionOptions={{
                sort: "-created",
                filter: `text != ""`,
              }}
              searchableColumns={["slug", "text"]}
            />
            <div className="text-2xl px-6 font-bold mt-6">Комментарии</div>
            <EntityTableWidget
              collectionName="comment"
              displayColumns={["post_id", "text"]}
              columnNames={{
                text: "Текст",
                post_id: "Пост ID",
              }}
              columnTransformers={{
                text: (text) => {
                  return text.length > 100 ? text.slice(0, 100) + "..." : text;
                },
              }}
              collectionOptions={{
                sort: "-created",
                filter: `text != ""`,
              }}
              searchableColumns={["post_id", "text"]}
            />
            <div className="p-6 text-center">
              <a
                href="https://valeronich.notion.site/teleblog-net-23269d14d077802eb7f3f74ca25c8b63?tb_button=true"
                target="_blank"
                className="c-link border-b-2 border-b-blue-400 border-dashed transition-colors mr-6"
              >
                База знаний teleblog.net
              </a>
              <a
                href="https://t.me/teleblog_robot?tb_button=true"
                target="_blank"
                className="c-link border-b-2 border-b-blue-400 border-dashed transition-colors"
              >
                Обратиться в поддержку
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
