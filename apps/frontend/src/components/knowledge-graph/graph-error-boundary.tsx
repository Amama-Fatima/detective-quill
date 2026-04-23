"use client";

import React from "react";

interface GraphErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface GraphErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GraphErrorBoundary extends React.Component<
  GraphErrorBoundaryProps,
  GraphErrorBoundaryState
> {
  constructor(props: GraphErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GraphErrorBoundaryState {
    return { hasError: true, error };
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;
      return <Fallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}
