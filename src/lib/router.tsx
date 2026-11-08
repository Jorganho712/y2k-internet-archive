import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

/** Roteador por hash: funciona em qualquer hospedagem estática. */
export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  if (!h || h === '/') return '/';
  return h.startsWith('/') ? h : `/${h}`;
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const on = () => setPath(currentPath());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}

export function navigate(path: string): void {
  const target = path.startsWith('/') ? path : `/${path}`;
  if (currentPath() === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  window.location.hash = target;
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  );
}
