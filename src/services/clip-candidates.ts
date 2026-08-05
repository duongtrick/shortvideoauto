type ClipCandidateInput = {
  sourceUrl?: string;
  transcript?: string;
  targetSeconds: number;
  maxClips: number;
};

type ClipCandidate = {
  index: number;
  startHint: string;
  endHint: string;
  title: string;
  hook: string;
  reason: string;
  estimatedSeconds: number;
  score: number;
};

const hookPatterns = [/khong ngo/i, /bi quyet/i, /sai lam/i, /dung mua/i, /deal/i, /giam gia/i, /ket qua/i, /truoc khi/i];

export function normalizeLongVideoUrl(input: string) {
  const url = new URL(input);
  if (url.protocol !== "https:") {
    throw new Error("Only HTTPS long video links are allowed.");
  }
  url.hash = "";
  return url.toString();
}

function cleanSentence(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function scoreSentence(sentence: string) {
  const hookScore = hookPatterns.some((pattern) => pattern.test(sentence)) ? 40 : 0;
  const lengthScore = sentence.length >= 60 && sentence.length <= 180 ? 30 : 10;
  const questionScore = sentence.includes("?") ? 15 : 0;
  const numberScore = /\d/.test(sentence) ? 15 : 0;
  return hookScore + lengthScore + questionScore + numberScore;
}

export function createClipCandidates(input: ClipCandidateInput) {
  const sourceUrl = input.sourceUrl ? normalizeLongVideoUrl(input.sourceUrl) : null;
  const sentences = (input.transcript ?? "")
    .split(/[.!?\n]+/)
    .map(cleanSentence)
    .filter((sentence) => sentence.length >= 24);

  const ranked = sentences
    .map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, input.maxClips);

  const candidates: ClipCandidate[] = ranked.map((item, index) => ({
    index: index + 1,
    startHint: `Around sentence ${item.index + 1}`,
    endHint: `About ${input.targetSeconds}s after start`,
    title: item.sentence.slice(0, 72),
    hook: item.sentence,
    reason: item.score >= 70 ? "Strong hook pattern for short-form retention." : "Clear standalone moment for a test clip.",
    estimatedSeconds: input.targetSeconds,
    score: item.score
  }));

  return {
    sourceUrl,
    candidates,
    nextStep: candidates.length ? "Render top 1-3 candidates as shorts." : "Add transcript or captions before clip scoring."
  };
}
