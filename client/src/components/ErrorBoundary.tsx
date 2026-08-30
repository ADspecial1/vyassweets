import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback: ReactNode };
type State = { failed: boolean };

/** Catches render errors in a subtree (e.g. WebGL) and shows a fallback
 *  instead of crashing the whole page. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.warn('[ErrorBoundary] subtree failed, showing fallback:', err);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
