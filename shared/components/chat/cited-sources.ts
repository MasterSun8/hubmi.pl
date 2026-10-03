import type { SolutionRef } from "@/types/chat";

// The chat backend returns every search hit as a source, but the assistant only recommends some of them
// by name. Show the ones it names (all of them when it names none), and each solution only once per
// conversation: a card already shown under an earlier answer is not repeated.
export function cardsPerMessage(messages: { content: string; sources?: SolutionRef[] }[]) {
  const shown = new Set<string>();
  return messages.map(({ content, sources = [] }) => {
    const text = content.toLocaleLowerCase("pl");
    const cited = sources.filter((source) => text.includes(source.title.toLocaleLowerCase("pl")));
    const cards = (cited.length > 0 ? cited : sources).filter((source) => !shown.has(source.id));
    for (const card of cards) shown.add(card.id);
    return cards;
  });
}
