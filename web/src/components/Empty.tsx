import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const Empty = ({ title, description, icon, action }: Props): JSX.Element => (
  <div className="card p-10 text-center flex flex-col items-center gap-3">
    <div className="rounded-full bg-white/5 p-4 text-ink-300">{icon ?? <Inbox className="h-6 w-6" />}</div>
    <h3 className="font-semibold text-ink-50">{title}</h3>
    {description && <p className="text-sm text-ink-300 max-w-md">{description}</p>}
    {action}
  </div>
);
