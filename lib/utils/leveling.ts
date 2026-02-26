export interface LevelInfo {
  level: number;
  name: string;
  minPoints: number;
  nextLevelPoints: number | null;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: "Początkujący sąsiad", minPoints: 0, nextLevelPoints: 100 },
  { level: 2, name: "Lokalny odkrywca", minPoints: 100, nextLevelPoints: 300 },
  {
    level: 3,
    name: "Świadomy konsument",
    minPoints: 300,
    nextLevelPoints: 600,
  },
  {
    level: 4,
    name: "Przyjaciel rzemiosła",
    minPoints: 600,
    nextLevelPoints: 1000,
  },
  {
    level: 5,
    name: "Strażnik lokalności",
    minPoints: 1000,
    nextLevelPoints: 1500,
  },
  {
    level: 6,
    name: "Eko-Mistrz Jarosławia",
    minPoints: 1500,
    nextLevelPoints: 2500,
  },
  { level: 7, name: "Legenda miasta", minPoints: 2500, nextLevelPoints: null },
];

export function getLevel(points: number): LevelInfo {
  const reversedLevels = [...LEVELS].reverse();
  const currentLevel =
    reversedLevels.find((l) => points >= l.minPoints) || LEVELS[0];
  return currentLevel;
}

export function getProgressToNextLevel(points: number): number {
  const current = getLevel(points);
  if (current.nextLevelPoints === null) return 100;

  const range = current.nextLevelPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.min(Math.round((progress / range) * 100), 100);
}

/**
 * Przelicza zaoszczędzone CO2 na pracę drzewa.
 * Przyjmujemy 20kg CO2 rocznie na jedno dojrzałe drzewo.
 */
export function getTreeWorkEquivalent(co2Saved: number): {
  trees: number;
  months: number;
  days: number;
} {
  const kgPerYearAtree = 20;

  // Total years of 1 tree's work
  const totalYears = co2Saved / kgPerYearAtree;

  const fullTrees = Math.floor(totalYears);
  const remainingYearFraction = totalYears - fullTrees;

  const totalMonths = remainingYearFraction * 12;
  const fullMonths = Math.floor(totalMonths);
  const remainingMonthFraction = totalMonths - fullMonths;

  const fullDays = Math.floor(remainingMonthFraction * 30);

  return {
    trees: fullTrees,
    months: fullMonths,
    days: fullDays,
  };
}

export function getCO2Context(co2Saved: number): string {
  if (co2Saved <= 0) return "Zacznij skanować, aby zobaczyć swój wpływ!";
  if (co2Saved < 5)
    return "To tyle, ile jedno drzewo pochłania przez 2 miesiące!";
  if (co2Saved < 20)
    return "To tyle, ile jedno drzewo pochłania przez pół roku!";
  if (co2Saved < 100)
    return "To tyle, co praca całego drzewa przez okrągły rok!";
  return "Zasadziłeś/aś wirtualny mały las!";
}

export function getBagsContext(bagsSaved: number): string {
  if (bagsSaved <= 0)
    return "Każdy skan to co najmniej jedna uratowana foliówka.";
  if (bagsSaved < 10)
    return "Gdyby ułożyć je jedna za drugą, miałyby długość samochodu osobowego.";
  if (bagsSaved < 20)
    return "Te torby ułożone jedna za drugą byłyby dłuższe niż autobus!";
  if (bagsSaved < 60) return "To wysokość 10-piętrowego bloku!";
  return "To długość boiska piłkarskiego!";
}
