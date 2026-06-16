const WEIGHTS = {
  ranking: 0.24,
  recentForm: 0.2,
  attack: 0.17,
  defense: 0.13,
  headToHead: 0.08,
  players: 0.18,
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

function playerScore(playerProfiles) {
  if (!playerProfiles?.players?.length) return 50

  const total = playerProfiles.players.reduce((sum, player) => {
    const historyScore = clamp(player.caps * 0.45 + player.goals * 1.25, 20, 100)
    const availabilityScore = player.status === 'starter' ? 100 : player.status === 'rotation' ? 82 : 62

    return (
      sum +
      historyScore * 0.24 +
      player.recentForm * 0.24 +
      player.performance * 0.28 +
      player.endurance * 0.18 +
      availabilityScore * 0.06
    )
  }, 0)

  return clamp(total / playerProfiles.players.length, 10, 100)
}

function weightedTeamScore(team, performance, headToHead, match, playerProfiles) {
  const baseScore =
    rankingScore(team) * WEIGHTS.ranking +
    recentFormScore(performance) * WEIGHTS.recentForm +
    attackScore(performance) * WEIGHTS.attack +
    defenseScore(performance) * WEIGHTS.defense +
    headToHeadScore(headToHead, team.id) * WEIGHTS.headToHead +
    playerScore(playerProfiles) * WEIGHTS.players

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

function expectedGoals(performanceA, performanceB, scoreA, scoreB) {
  const baseA =
    performanceA.goalsFor / 5 * 0.58 + (performanceB.goalsAgainst / 5) * 0.42
  const baseB =
    performanceB.goalsFor / 5 * 0.58 + (performanceA.goalsAgainst / 5) * 0.42
  const modelDiff = clamp((scoreA - scoreB) / 45, -0.45, 0.45)

  return {
    teamA: Number(clamp(baseA + modelDiff, 0.2, 4.2).toFixed(2)),
    teamB: Number(clamp(baseB - modelDiff, 0.2, 4.2).toFixed(2)),
  }
}

function probableScore(probabilities, goals) {
  let goalsA = clamp(Math.round(goals.teamA), 0, 4)
  let goalsB = clamp(Math.round(goals.teamB), 0, 4)


  if (probabilities.teamAWin > probabilities.teamBWin + 12 && goalsA <= goalsB) goalsA = goalsB + 1
  if (probabilities.teamBWin > probabilities.teamAWin + 12 && goalsB <= goalsA) goalsB = goalsA + 1
  if (probabilities.draw >= 30 && Math.abs(probabilities.teamAWin - probabilities.teamBWin) <= 18) {
    goalsB = goalsA
  }

  return `${goalsA}-${goalsB}`
}

function scoreFromProbableScore(score) {
  const [teamA, teamB] = score.split('-').map(Number)
  return { teamA, teamB }
}

function expectedGoalLabel(totalGoals) {
  if (totalGoals >= 3.1) return 'Plus de 2.5 buts'
  if (totalGoals <= 2.05) return 'Moins de 2.5 buts'
  return '2 à 3 buts'
}

function scorerCandidates(playerProfiles, teamName) {
  if (!playerProfiles?.players?.length) return []

  return playerProfiles.players
    .map((player) => {
      const scorerBias = ['BU', 'Ailier', 'MO'].includes(player.position) ? 1 : 0.58
      const output = player.caps ? player.goals / player.caps : 0
      const chance = clamp(
        output * 88 * scorerBias + player.recentForm * 0.22 + player.performance * 0.18,
        6,
        58,
      )

      return {
        name: player.name,
        team: teamName,
        position: player.position,
        chance: Math.round(chance),
      }
    })
    .sort((a, b) => b.chance - a.chance)
    .slice(0, 3)
}

function predictedOutcomeLabel(probabilities, teamA, teamB) {
  if (
    probabilities.teamAWin >= probabilities.draw &&
    probabilities.teamAWin >= probabilities.teamBWin
  ) {
    return `${teamA.name} ou nul`.replace(' ou nul', probabilities.teamAWin - probabilities.draw > 10 ? '' : ' ou nul')
  }
  if (
    probabilities.teamBWin >= probabilities.draw &&
    probabilities.teamBWin >= probabilities.teamAWin
  ) {
    return `${teamB.name} ou nul`.replace(' ou nul', probabilities.teamBWin - probabilities.draw > 10 ? '' : ' ou nul')
  }

  return 'Match nul'
}

function goalPredictions(probabilities, teamA, teamB, playersA, playersB, goals, exactScore) {
  const totalGoals = Number((goals.teamA + goals.teamB).toFixed(2))
  const score = scoreFromProbableScore(exactScore)
  const topScorers = [
    ...scorerCandidates(playersA, teamA.name),
    ...scorerCandidates(playersB, teamB.name),
  ]
    .sort((a, b) => b.chance - a.chance)
    .slice(0, 5)
  const primaryScorer = topScorers[0]
  const secondaryScorer = topScorers.find((player) => player.name !== primaryScorer?.name)
  const bothTeamsScore = goals.teamA >= 0.85 && goals.teamB >= 0.85
  const totalLabel = expectedGoalLabel(totalGoals)

  return {
    totalGoals,
    totalGoalsLabel: totalLabel,
    teamGoals: {
      teamA: score.teamA,
      teamB: score.teamB,
      expectedTeamA: goals.teamA,
      expectedTeamB: goals.teamB,
    },
    topScorers,
    combos: [
      `${predictedOutcomeLabel(probabilities, teamA, teamB)} + ${totalLabel}`,
      `Score exact estimé ${teamA.name} ${score.teamA}-${score.teamB} ${teamB.name}`,
      primaryScorer
        ? `${primaryScorer.name} marque ou tire le plus (${primaryScorer.team})`
        : 'Aucun buteur clair',
      `${bothTeamsScore ? 'Les deux équipes marquent' : 'Au moins une équipe ne marque pas'} + total estimé ${totalGoals}`,
      secondaryScorer
        ? `${primaryScorer?.name || teamA.name} / ${secondaryScorer.name} buteurs possibles`
        : `${teamA.name} ${score.teamA} but(s), ${teamB.name} ${score.teamB} but(s)`,
    ],
  }
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

export function calculatePrediction({
  match,
  teamA,
  teamB,
  performanceA,
  performanceB,
  playersA,
  playersB,
  headToHead,
}) {
  const scoreA = weightedTeamScore(teamA, performanceA, headToHead, match, playersA)
  const scoreB = weightedTeamScore(teamB, performanceB, headToHead, match, playersB)
  const probabilities = normalizeProbabilities(scoreA, scoreB, performanceA, performanceB)
  const goals = expectedGoals(performanceA, performanceB, scoreA, scoreB)
  const exactScore = probableScore(probabilities, goals)

  return {
    teamAScore: Number(scoreA.toFixed(1)),
    teamBScore: Number(scoreB.toFixed(1)),
    probabilities,
    probableScore: exactScore,
    goalPredictions: goalPredictions(probabilities, teamA, teamB, playersA, playersB, goals, exactScore),
    confidence: confidenceLevel(probabilities, match, headToHead),
    badges: badges(probabilities, teamA, teamB),
    factors: {
      ranking: [rankingScore(teamA), rankingScore(teamB)],
      recentForm: [recentFormScore(performanceA), recentFormScore(performanceB)],
      attack: [attackScore(performanceA), attackScore(performanceB)],
      defense: [defenseScore(performanceA), defenseScore(performanceB)],
      headToHead: [headToHeadScore(headToHead, teamA.id), headToHeadScore(headToHead, teamB.id)],
      players: [playerScore(playersA), playerScore(playersB)],
    },
  }
}

export default { calculatePrediction }
