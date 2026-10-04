// Social innovation canvas (Kanwa innowacji społecznych, module III): shared by
// GET/PUT/POST /api/conversations/[id]/canvas, the canvas page and the admin panel.
// The field set is ours: replace it with ROPS's canvas once we have their file.

export const CANVAS_FIELDS = [
  { key: "problem", label: "Problem", question: "Jaki problem społeczny chcesz rozwiązać?" },
  { key: "audience", label: "Odbiorcy", question: "Kogo dotyczy problem i kto skorzysta z rozwiązania?" },
  { key: "solution", label: "Rozwiązanie", question: "Na czym polega pomysł i jak ma działać?" },
  { key: "value", label: "Zmiana", question: "Co zmieni się w życiu odbiorców?" },
  { key: "resources", label: "Zasoby", question: "Czego potrzebujesz: ludzi, miejsca, sprzętu, wiedzy?" },
  { key: "partners", label: "Partnerzy", question: "Kto może pomóc: gmina, organizacje, firmy, mieszkańcy?" },
  { key: "costs", label: "Koszty i finansowanie", question: "Ile to może kosztować i skąd wziąć pieniądze?" },
  { key: "impact", label: "Miary sukcesu", question: "Po czym poznasz, że rozwiązanie działa?" },
  { key: "risks", label: "Ryzyka", question: "Co może pójść nie tak i jak temu zaradzić?" },
] as const;

export type CanvasField = (typeof CANVAS_FIELDS)[number]["key"];

// Every field is plain text; an empty string means not filled in yet.
export type Canvas = Record<CanvasField, string>;

export const CANVAS_FIELD_MAX = 2000;

export const emptyCanvas = (): Canvas =>
  Object.fromEntries(CANVAS_FIELDS.map((field) => [field.key, ""])) as Canvas;
