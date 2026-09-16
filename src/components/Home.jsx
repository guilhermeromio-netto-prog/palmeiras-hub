import MatchCard from './MatchCard'
import FormDots from './FormDots'
import { formatDate, scoreLine, matchTitle } from '../utils/format'

export default function Home({ data }) {
  const recent = (data.recentResults || []).slice(0, 3)

  return (
    <section className="page home">
      <div className="hero-strip">
        <div className="monogram" aria-hidden="true">
          <span>P</span>
        </div>
        <div>
          <p className="eyebrow">Hub do torcedor</p>
          <h2>Avanti Palestra</h2>
          <p className="lede">
            Próximo jogo, forma recente e o pulso do Brasileirão — tudo no verde.
          </p>
        </div>
      </div>

      <h3 className="section-title">Próximo confronto</h3>
      {data.nextMatch ? (
        <MatchCard match={data.nextMatch} form={data.form} featured />
      ) : (
        <article className="card match-card featured">
          <p className="muted">
            Sem jogos futuros na temporada {data.standings?.season || 'atual'} disponível na API.
            Confira os resultados recentes abaixo.
          </p>
          {data.form?.length > 0 && (
            <p className="form-line">Forma recente · veja os pontos verdes/vermelhos nos resultados</p>
          )}
        </article>
      )}

      {data.stats && (
        <div className="stats-mini grid-4">
          <div className="stat-tile">
            <span className="num">{data.stats.position}º</span>
            <span className="lbl">Posição</span>
          </div>
          <div className="stat-tile">
            <span className="num">{data.stats.points}</span>
            <span className="lbl">Pontos</span>
          </div>
          <div className="stat-tile">
            <span className="num">
              {data.stats.won}-{data.stats.draw}-{data.stats.lost}
            </span>
            <span className="lbl">V-E-D</span>
          </div>
          <div className="stat-tile">
            <span className="num">
              {data.stats.goalsFor}:{data.stats.goalsAgainst}
            </span>
            <span className="lbl">Gols</span>
          </div>
        </div>
      )}

      <h3 className="section-title">Resultados recentes</h3>
      <div className="list-stack">
        {recent.length === 0 && <p className="muted">Sem resultados recentes.</p>}
        {recent.map((m) => (
          <article key={m.id} className="card row-card">
            <div>
              <span className="pill tiny">{m.competition}</span>
              <strong>{matchTitle(m)}</strong>
              <p className="muted">{formatDate(m.date)} · {m.venue}</p>
            </div>
            <div className="row-card__right">
              <span className={`result-badge ${(m.result || '').toLowerCase()}`}>
                {scoreLine(m) || '—'}
              </span>
              {m.result && <FormDots form={[m.result]} />}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
