import { RecordModel } from "pocketbase";
import { eitherFetch } from "../http";
import { PaasiblePB } from "./pocketbase";
import { eitherFetchPb } from "../pb";

export type PaasibleApiCfg = {
  host: string;
  pb: PaasiblePB;
};

export type GetRepositoriesResponseData = {
  repositories: string[];
};

export type ConfigModel = RecordModel & {
  id: string;
  created: string;
  updated: string;
  workspace_id: string;

  description?: string;
  seo_title?: string;
  seo_description?: string;
  yandex_metrika_counter?: string;
  google_analytics_counter?: string;
  main_color?: string;
  custom_css?: string;
  subscribe_button?: string;
  logo_url?: string;
  ai_seo_turned_on?: boolean;
};

export type ConfigModelUpdatable = Partial<ConfigModel>;

export type SiteDomain = RecordModel & {
  name: string;
  config_id: string;
  seo_hidden: boolean;
  is_certified: boolean;
};

export type PaasibleApi = ReturnType<typeof PaasibleApi>;
export const PaasibleApi = (api: PaasibleApiCfg) => {
  const { pb } = api;

  return {
    pb,
    Queries: {
      getTgToken: async (userId: string) => {
        const res = await pb
          .collection("tg_verification_token")
          .getFirstListItem("user_id='" + userId + "'");

        return res;
      },
      getConfig: async (workspaceId: string) => {
        const res = await pb
          .collection<ConfigModel>("config")
          .getFirstListItem("workspace_id='" + workspaceId + "'");

        return res;
      },
      getPosts: async (workspaceId: string, page: number, perPage: number) => {
        return pb.collection("post").getList(page, perPage, {
          filter: "chat_id.config_id.workspace_id='" + workspaceId + "'",
          sort: "-created",
        });
      },
      getComments: async (
        workspaceId: string,
        page: number,
        perPage: number
      ) => {
        return pb.collection("comment").getList(page, perPage, {
          filter: "chat_id.config_id.workspace_id='" + workspaceId + "'",
          sort: "-created",
        });
      },
      getDomains: async (
        workspaceId: string,
        page: number,
        perPage: number
      ) => {
        return pb.collection<SiteDomain>("site_domain").getList(page, perPage, {
          filter: "config_id.workspace_id='" + workspaceId + "'",
          sort: "-created",
        });
      },
    },

    Mutations: {
      createDomain: async (data: {
        name: string;
        config_id: string;
        seo_hidden: boolean;
      }) => {
        return pb.collection<SiteDomain>("site_domain").create(data);
      },
      updateDomain: async (domainId: string, data: Partial<SiteDomain>) => {
        return pb.collection<SiteDomain>("site_domain").update(domainId, data);
      },
      deleteDomain: async (domainId: string) => {
        return pb.collection("site_domain").delete(domainId);
      },
      updateConfig: async (configId: string, data: ConfigModelUpdatable) => {
        return pb.collection<ConfigModel>("config").update(configId, data);
      },
      signUp: async (values: { username: string; password: string }) => {
        return pb.collection("users").create({
          username: values.username,
          password: values.password,
          passwordConfirm: values.password,
        });
      },
      signIn: async (values: { username: string; password: string }) => {
        return pb
          .collection("users")
          .authWithPassword(values.username, values.password);
      },
      setSslCert: async (domainName: string) => {
        return eitherFetchPb(
          api.pb.send("/api/set-ssl-cert", {
            method: "POST",
            body: {
              domain_name: domainName,
            },
          })
        );
      },
      uploadHistory: async (file: File) => {
        const formData = new FormData();

        formData.append("file", file);

        const host = api.host === "/" ? "" : api.host;

        return eitherFetch(
          fetch(`${host}/api/upload-history`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${pb.authStore.token}`,
            },
          })
        );
      },
    },
  };
};
