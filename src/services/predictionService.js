const WEIGHTS = {
  ranking: 0.3,
  recentForm: 0.25,
  attack: 0.2,
  defense: 0.15,
  headToHead: 0.1,
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const round = (value) => Math.round(value)

const formPoints = { W: 3, D: 1, L: 0 }

function rankingScore(team) {
  return clamp(((211 - team.fifaRanking) / 210) * 100, 8, 100)
}

function recentFormScore(performance) {
  const total = performance.lastMatches.reduce((sum, result) => sum + formPoints[result], 0)
  return (total / (performance.lastMatches.length * 3)) * 100
}

function attackScore(performance) {
  return clamp((performance.goalsFor / 5 / 2) * 100, 5, 100)
}

function defenseScore(performance) {
  return clamp((1 - performance.goalsAgainst / 5 / 2.5) * 100, 5, 100)
}

function headToHeadScore(headToHead, teamId) {
  if (!headToHead || headToHead.matchesPlayed === 0) return 50

  const isTeamA = headToHead.teamAId === teamId
  const wins = isTeamA ? headToHead.teamAWins : headToHead.teamBWins
  const goalsFor = isTeamA ? headToHead.goalsA : headToHead.goalsB
  const goalsAgainst = isTeamA ? headToHead.goalsB : headToHead.goalsA
  const resultScore = ((wins * 3 + headToHead.draws) / (headToHead.matchesPlayed * 3)) * 75
  const goalScore = clamp(50 + (goalsFor - goalsAgainst) * 5, 20, 80) * 0.25

  return clamp(resultScore + goalScore, 10, 100)
}

function weightedTeamScore(team, performance, headToHead, match) {
  const baseScore =
    rankingScore(team) * WEIGHTS.ranking +
    recentFormScore(performance) * WEIGHTS.recentForm +
    attackScore(performance) * WEIGHTS.attack +
    defenseScore(performance) * WEIGHTS.defense +
    headToHeadScore(headToHead, team.id) * WEIGHTS.headToHead

  const homeBonus = match.homeAdvantageTeamId === team.id ? 4 : 0
  const importanceBonus = clamp((match.importance || 0.7) * 3, 0, 3)

  return baseScore + homeBonus + importanceBonus
}

function normalizeProbabilities(scoreA, scoreB, performanceA, performanceB) {
  const diff = scoreA - scoreB
  const defensiveBalance =
    (defenseScore(performanceA) + defenseScore(performanceB)) / 2 > 72 ? 2 : 0
  const drawProbability = clamp(31 - Math.abs(diff) * 0.28 + defensiveBalance, 18, 34)
  const remaining = 100 - drawProbability
  const favoriteShare = clamp(0.5 + diff / 75, 0.2, 0.8)

  let teamAWin = remaining * favoriteShare
  let teamBWin = remaining - teamAWin

  teamAWin = round(teamAWin)
  const draw = round(drawProbability)
  teamBWin = 100 - teamAWin - draw

  return { teamAWin, draw, teamBWin }
}

function probableScore(probabilities, performanceA, performanceB) {
  const expectedA =
    performanceA.goalsFor / 5 * 0.58 + (performanceB.goalsAgainst / 5) * 0.42
  const expectedB =
    performanceB.goalsFor / 5 * 0.58 + (performanceA.goalsAgainst / 5) * 0.42

  let goalsA = clamp(Math.round(expectedA), 0, 4)
  let goalsB = clamp(Math.round(expectedB), 0, 4)

  if (probabilities.teamAWin > probabilities.teamBWin + 12 && goalsA <= goalsB) goalsA = goalsB + 1
  if (probabilities.teamBWin > probabilities.teamAWin + 12 && goalsB <= goalsA) goalsB = goalsA + 1
  if (probabilities.draw >= 30 && Math.abs(probabilities.teamAWin - probabilities.teamBWin) <= 18) {
    goalsB = goalsA
  }

  return `${goalsA}-${goalsB}`
}

function confidenceLevel(probabilities, match, headToHead) {
  const spread = Math.max(probabilities.teamAWin, probabilities.teamBWin) - probabilities.draw
  const sampleBonus = headToHead?.matchesPlayed >= 5 ? 1 : 0
  const score = spread + (match.importance || 0.7) * 8 + sampleBonus

  if (score >= 42) return { label: 'Confiance élevée', level: 'high' }
  if (score >= 24) return { label: 'Confiance moyenne', level: 'medium' }
  return { label: 'Confiance faible', level: 'low' }
}

function badges(probabilities, teamA, teamB) {
  const spread = Math.abs(probabilities.teamAWin - probabilities.teamBWin)
  const favorite =
    probabilities.teamAWin === probabilities.teamBWin
      ? null
      : probabilities.teamAWin > probabilities.teamBWin
        ? teamA.name
        : teamB.name

  return {
    favorite,
    isCloseMatch: spread <= 12,
  }
}

export function calculatePrediction({ match, teamA, teamB, performanceA, performanceB, headToHead }) {
  const scoreA = weightedTeamScore(teamA, performanceA, headToHead, match)
  const scoreB = weightedTeamScore(teamB, performanceB, headToHead, match)
  const probabilities = normalizeProbabilities(scoreA, scoreB, performanceA, performanceB)

  return {
    teamAScore: Number(scoreA.toFixed(1)),
    teamBScore: Number(scoreB.toFixed(1)),
    probabilities,
    probableScore: probableScore(probabilities, performanceA, performanceB),
    confidence: confidenceLevel(probabilities, match, headToHead),
    badges: badges(probabilities, teamA, teamB),
    factors: {
      ranking: [rankingScore(teamA), rankingScore(teamB)],
      recentForm: [recentFormScore(performanceA), recentFormScore(performanceB)],
      attack: [attackScore(performanceA), attackScore(performanceB)],
      defense: [defenseScore(performanceA), defenseScore(performanceB)],
      headToHead: [headToHeadScore(headToHead, teamA.id), headToHeadScore(headToHead, teamB.id)],
    },
  }
}

export default { calculatePrediction }
