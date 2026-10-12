export type Template = {
  id: string;
  name: string;
  thumbnail: string;
};

export const templates: readonly Template[] = [
  { id: "co-dien", name: "Cổ điển", thumbnail: "/templates/co-dien.svg" },
  { id: "hoa-dao", name: "Hoa đào", thumbnail: "/templates/hoa-dao.svg" },
  { id: "toi-gian", name: "Tối giản", thumbnail: "/templates/toi-gian.svg" },
];

export function findTemplate(id: string | string[] | undefined) {
  return typeof id === "string"
    ? templates.find((t) => t.id === id)
    : undefined;
}
