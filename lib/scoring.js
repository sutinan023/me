export const TYPE_NAMES = {
  INTJ:"The Strategic Architect", INTP:"The Curious Analyst", ENTJ:"The Driving Strategist", ENTP:"The Inventive Challenger",
  INFJ:"The Insightful Guide", INFP:"The Reflective Idealist", ENFJ:"The Empathic Catalyst", ENFP:"The Imaginative Connector",
  ISTJ:"The Grounded Organizer", ISFJ:"The Steady Supporter", ESTJ:"The Practical Director", ESFJ:"The Warm Coordinator",
  ISTP:"The Calm Problem-Solver", ISFP:"The Gentle Explorer", ESTP:"The Agile Doer", ESFP:"The Joyful Energizer"
};

export function scoreAssessment(questions, answers) {
  const totals = { EI:0, SN:0, TF:0, JP:0 };
  const counts = { EI:0, SN:0, TF:0, JP:0 };

  questions.forEach((q, index) => {
    const answer = answers[index];
    if (answer == null) return;
    const centered = (Number(answer) - 4) * q.direction;
    totals[q.dimension] += centered;
    counts[q.dimension] += 1;
  });

  const dims = {};
  for (const key of ["EI","SN","TF","JP"]) {
    const max = counts[key] * 3;
    dims[key] = max ? Math.round(((totals[key] + max) / (2 * max)) * 100) : 50;
  }

  const type =
    (dims.EI < 50 ? "E" : "I") +
    (dims.SN < 50 ? "S" : "N") +
    (dims.TF < 50 ? "T" : "F") +
    (dims.JP < 50 ? "J" : "P");

  return { type, dims, name: TYPE_NAMES[type] };
}

export function clarity(value) {
  const distance = Math.abs(value - 50);
  if (distance <= 5) return "Balanced";
  if (distance <= 15) return "Slight preference";
  if (distance <= 30) return "Moderate preference";
  return "Clear preference";
}

export function adjacentTypes(type, dims) {
  const pairs = [["EI","E","I"],["SN","S","N"],["TF","T","F"],["JP","J","P"]];
  return pairs.flatMap(([key,a,b],index) => {
    if (Math.abs(dims[key] - 50) > 10) return [];
    const chars = type.split("");
    chars[index] = chars[index] === a ? b : a;
    return [chars.join("")];
  });
}
