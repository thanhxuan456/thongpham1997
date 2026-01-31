const createQueryBuilder = (table: string) => {
  let queryParams: any = {};
  let selectedColumns = "*";
  let orderByColumn = "";
  let orderDirection = "desc";
  let limitCount: number | null = null;
  let filters: Array<{ column: string; op: string; value: any }> = [];

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (selectedColumns !== "*") params.set("select", selectedColumns);
    if (orderByColumn) params.set("orderBy", `${orderByColumn}:${orderDirection}`);
    if (limitCount) params.set("limit", limitCount.toString());
    filters.forEach((f, i) => {
      params.set(`filter${i}`, `${f.column}:${f.op}:${f.value}`);
    });
    return params.toString() ? `?${params.toString()}` : "";
  };

  const executeQuery = async (method: string = "GET", body?: any) => {
    try {
      const url = `/api/${table}${buildQueryString()}`;
      const options: RequestInit = {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      };
      if (body) options.body = JSON.stringify(body);
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        return { data: null, error: { message: data.error || "Request failed" } };
      }
      return { data: Array.isArray(data) ? data : [data], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  };

  return {
    select: (columns: string = "*") => {
      selectedColumns = columns;
      return {
        eq: (column: string, value: any) => {
          filters.push({ column, op: "eq", value });
          return {
            single: async () => {
              const result = await executeQuery();
              return { data: result.data?.[0] || null, error: result.error };
            },
            maybeSingle: async () => {
              const result = await executeQuery();
              return { data: result.data?.[0] || null, error: result.error };
            },
            order: (col: string, opts?: { ascending?: boolean }) => {
              orderByColumn = col;
              orderDirection = opts?.ascending ? "asc" : "desc";
              return {
                limit: (count: number) => {
                  limitCount = count;
                  return {
                    then: (resolve: Function) => executeQuery().then(resolve),
                  };
                },
                then: (resolve: Function) => executeQuery().then(resolve),
              };
            },
            then: (resolve: Function) => executeQuery().then(resolve),
          };
        },
        in: (column: string, values: any[]) => {
          filters.push({ column, op: "in", value: values.join(",") });
          return {
            then: (resolve: Function) => executeQuery().then(resolve),
          };
        },
        order: (column: string, opts?: { ascending?: boolean }) => {
          orderByColumn = column;
          orderDirection = opts?.ascending ? "asc" : "desc";
          return {
            limit: (count: number) => {
              limitCount = count;
              return {
                then: (resolve: Function) => executeQuery().then(resolve),
              };
            },
            then: (resolve: Function) => executeQuery().then(resolve),
          };
        },
        then: (resolve: Function) => executeQuery().then(resolve),
      };
    },
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          const result = await executeQuery("POST", data);
          return { data: result.data?.[0] || null, error: result.error };
        },
        then: (resolve: Function) => executeQuery("POST", data).then(resolve),
      }),
      then: (resolve: Function) => executeQuery("POST", data).then(resolve),
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => {
        filters.push({ column, op: "eq", value });
        return {
          select: () => ({
            single: async () => {
              const result = await executeQuery("PUT", data);
              return { data: result.data?.[0] || null, error: result.error };
            },
            then: (resolve: Function) => executeQuery("PUT", data).then(resolve),
          }),
          then: (resolve: Function) => executeQuery("PUT", data).then(resolve),
        };
      },
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        filters.push({ column, op: "eq", value });
        return {
          then: (resolve: Function) => executeQuery("DELETE").then(resolve),
        };
      },
    }),
    upsert: (data: any) => ({
      select: () => ({
        single: async () => {
          const result = await executeQuery("PUT", data);
          return { data: result.data?.[0] || null, error: result.error };
        },
        then: (resolve: Function) => executeQuery("PUT", data).then(resolve),
      }),
      then: (resolve: Function) => executeQuery("PUT", data).then(resolve),
    }),
  };
};

const tableNameMap: Record<string, string> = {
  themes: "themes",
  orders: "orders",
  order_items: "order-items",
  coupons: "coupons",
  settings: "settings",
  menu_items: "menu-items",
  email_templates: "email-templates",
  subscribers: "subscribers",
  support_tickets: "support/tickets",
  ticket_messages: "support/messages",
  chat_ratings: "chat-ratings",
  profiles: "admin/users",
  user_roles: "admin/users",
  admin_notifications: "admin/notifications",
};

export const supabase = {
  from: (table: string) => {
    const mappedTable = tableNameMap[table] || table;
    return createQueryBuilder(mappedTable);
  },
  auth: {
    getSession: async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const user = await response.json();
          return { data: { session: { user } }, error: null };
        }
        return { data: { session: null }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    },
    getUser: async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const user = await response.json();
          return { data: { user }, error: null };
        }
        return { data: { user: null }, error: null };
      } catch {
        return { data: { user: null }, error: null };
      }
    },
    onAuthStateChange: (callback: Function) => {
      fetch("/api/auth/me", { credentials: "include" })
        .then(res => res.ok ? res.json() : null)
        .then(user => callback("SIGNED_IN", user ? { user } : null))
        .catch(() => callback("SIGNED_OUT", null));
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { data: null, error: { message: data.error } };
      }
      return { data: { user: data.user, session: { user: data.user } }, error: null };
    },
    signOut: async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      return { error: null };
    },
  },
  functions: {
    invoke: async (name: string, options?: { body?: any }) => {
      const endpoint = name === "send-otp" ? "/api/auth/send-otp" :
                       name === "verify-otp" ? "/api/auth/verify-otp" :
                       name === "reset-password" ? "/api/auth/reset-password" :
                       name === "generate-thumbnail" ? "/api/generate-thumbnail" :
                       `/api/${name}`;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(options?.body || {}),
        });
        const data = await response.json();
        if (!response.ok) {
          return { data: null, error: { message: data.error } };
        }
        return { data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        console.log("Storage upload not implemented yet");
        return { data: null, error: { message: "Storage not implemented" } };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `/api/storage/${path}` },
      }),
      remove: async (paths: string[]) => {
        console.log("Storage remove not implemented yet");
        return { data: null, error: null };
      },
    }),
  },
  channel: (name: string) => ({
    on: (event: string, filter: any, callback: Function) => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
  }),
  removeChannel: (channel: any) => {},
};

export type Database = any;
