export interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({
  title = 'DragAndSwap',
  subtitle = 'A mindful picture puzzle',
}: HeaderProps) {
  return (
    <header className="game-header">
      <h1 className="game-title">{title}</h1>
      {subtitle && <p className="game-subtitle">{subtitle}</p>}
    </header>
  );
}
