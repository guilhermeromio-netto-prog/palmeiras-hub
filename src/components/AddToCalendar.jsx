import { downloadMatchIcs, downloadUpcomingIcs } from '../utils/ics'

/**
 * Botão(ões) para baixar .ics do próximo jogo e/ou agenda.
 */
export default function AddToCalendar({ match, upcoming = [], compact = false }) {
  if (!match && !(upcoming || []).length) return null

  const onNext = () => {
    if (match) downloadMatchIcs(match)
  }
  const onList = () => {
    const list = upcoming?.length ? upcoming : match ? [match] : []
    downloadUpcomingIcs(list)
  }

  return (
    <div className={`add-cal${compact ? ' add-cal--compact' : ''}`}>
      {match && (
        <button
          type="button"
          className="btn add-cal__btn touch"
          onClick={onNext}
          title="Baixa um arquivo .ics para importar no Google Calendar, Apple ou Outlook"
        >
          📅 Adicionar ao calendário
        </button>
      )}
      {(upcoming || []).length > 1 && (
        <button
          type="button"
          className="btn ghost add-cal__btn add-cal__btn--secondary touch"
          onClick={onList}
          title="Baixa .ics com os próximos jogos"
        >
          Baixar próximos ({Math.min(upcoming.length, 12)})
        </button>
      )}
      <p className="muted tiny add-cal__hint">
        Arquivo .ics — abra no app de calendário (Google / Apple / Outlook). Horário em UTC no
        arquivo; o app converte para o seu fuso.
      </p>
    </div>
  )
}
