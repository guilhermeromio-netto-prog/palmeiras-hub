export default function MatchDayBanner({ matchTitle }) {
  return (
    <div className="matchday-banner" role="status">
      <span className="matchday-banner__pulse" aria-hidden="true" />
      <div>
        <strong>Dia de jogo</strong>
        <span>{matchTitle ? ` · ${matchTitle}` : ' · Avanti Palestra!'}</span>
      </div>
    </div>
  )
}
