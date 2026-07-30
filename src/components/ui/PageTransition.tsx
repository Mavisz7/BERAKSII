import { type ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setDisplayChildren(children);
  }, [pathname, children]);

  return (
    <div key={pathname} className="page-enter">
      {displayChildren}
    </div>
  );
}
