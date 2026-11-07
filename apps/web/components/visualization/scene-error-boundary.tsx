"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export class SceneErrorBoundary extends Component<
  {
    children: ReactNode;
    fallback: ReactNode;
    onError?: (message: string) => void;
    resetKey?: string;
  },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError?.(error.message || "The 3D renderer could not start.");
  }

  override componentDidUpdate(previous: { resetKey?: string }) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey)
      this.setState({ failed: false });
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
