import { useState } from 'react'
import Squad from './Squad'
import Lineup from './Lineup'
import Discipline from './Discipline'

const SUBS = [
  { id: 'squad', label: 'Elenco' },
  { id: 'lineup', label: 'Escalação' },
  { id: 'cards', label: 'Cartões' },
]

export default function Team({ data }) {
  const [sub, setSub] = useState('squad')

  return (
    <section className="page team">
      <h2>Time</h2>
      <p className="lede">Elenco, última escalação com formação e disciplina.</p>

      <div className="subtabs" role="tablist" aria-label="Seções do time">
        {SUBS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={sub === s.id}
            className={sub === s.id ? 'active' : ''}
            onClick={() => setSub(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sub === 'squad' && <Squad data={data} />}
      {sub === 'lineup' && <Lineup data={data} />}
      {sub === 'cards' && <Discipline data={data} />}
    </section>
  )
}
