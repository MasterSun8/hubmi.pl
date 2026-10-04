const headings = /(?:^|\s)(\d{1,2})\.\s+(Na czym polega rozwiązanie\?|Jakich problemów dotyczy innowacja\?|Grupa docelowa|Kto może skorzystać z innowacji\?|Czy to działa\?|Autorzy)(?=\s|$)/giu;
const noise = /dowiedz się więcej\s+zobacz film\s+pobierz materiały\s+sprawdź zasady wykorzystania\s+otwórz w telefonie/giu;

export function descriptionSections(description: string) {
  const text = description.replace(noise, "").trim();
  const matches = [...text.matchAll(headings)];
  if (matches.length === 0) return [{ title: "Opis innowacji", content: text }];
  const intro = text.slice(0, matches[0].index).trim();
  return [
    ...(intro ? [{ title: "O innowacji", content: intro }] : []),
    ...matches.map((match, index) => ({
      title: match[2],
      content: text.slice(match.index! + match[0].length, matches[index + 1]?.index ?? text.length).trim(),
    })),
  ];
}

export function InnovationDescription({ description }: { description: string }) {
  return descriptionSections(description).map((section, index) => (
    <section key={`${section.title}-${index}`} className="flex flex-col gap-5 border-t border-line pt-7.5">
      <h2 className="font-light text-subtitle text-primary">{section.title}</h2>
      <p className="max-w-[65ch] whitespace-pre-wrap">{section.content}</p>
    </section>
  ));
}
