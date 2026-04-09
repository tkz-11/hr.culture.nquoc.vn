import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  feature?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.feature || 'Feature'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-12 text-center">
          <p className="text-4xl mb-4">🩹</p>
          <h3 className="text-lg font-bold text-rose-900 font-header">
            {this.props.feature ? `Lỗi tại ${this.props.feature}` : 'Đã có lỗi xảy ra'}
          </h3>
          <p className="text-sm text-rose-700 mt-2 max-w-sm mx-auto">
            Chúng tôi xin lỗi vì sự bất tiện này. Dữ liệu này tạm thời không khả dụng. 
            Bạn hãy thử làm mới trang hoặc quay lại sau nhé.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-6 px-6 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
