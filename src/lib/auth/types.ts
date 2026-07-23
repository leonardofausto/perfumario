export type ActionState<TFields extends Record<string, string> = Record<string, string>> = {
  status: "idle" | "success" | "error";
  message?: string;
  fields?: Partial<TFields>;
  fieldErrors?: Partial<Record<keyof TFields, string[]>>;
};
