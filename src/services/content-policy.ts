export type PolicyCheckResult = {
  allowed: boolean;
  reasons: string[];
  disclosure: string;
};

const blockedPatterns = [
  /chua khoi|tri dut diem|cam ket khoi/i,
  /giam can than toc|giam \d+kg/i,
  /thuoc|duoc pham|benh/i,
  /bao hanh loi nhuan|kiem tien chac chan/i
];

export function checkAffiliateContentPolicy(text: string): PolicyCheckResult {
  const reasons = blockedPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => `Matched sensitive claim: ${pattern.source}`);

  return {
    allowed: reasons.length === 0,
    reasons,
    disclosure: "Noi dung co the chua lien ket tiep thi. Gia va khuyen mai co the thay doi."
  };
}

export function appendAffiliateDisclosure(script: string) {
  const check = checkAffiliateContentPolicy(script);
  if (script.includes(check.disclosure)) return script;
  return `${script}\n\n${check.disclosure}`;
}
