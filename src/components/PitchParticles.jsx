/** Partículas / orbs leves sobre o fundo do estádio (CSS-only, aria-hidden). */
export default function PitchParticles() {
  return (
    <div className="pitch-particles" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className={`pitch-orb pitch-orb--${(i % 5) + 1}`} />
      ))}
    </div>
  )
}
