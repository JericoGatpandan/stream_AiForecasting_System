import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Stack,
    Collapse,
    Alert
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BugReportIcon from '@mui/icons-material/BugReport';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo
        });

        // Call optional error callback
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false
        });
    };

    handleToggleDetails = () => {
        this.setState(prevState => ({
            showDetails: !prevState.showDetails
        }));
    };

    handleReportError = () => {
        const { error, errorInfo } = this.state;
        
        // In a real application, you would send this to your error reporting service
        const errorReport = {
            message: error?.message,
            stack: error?.stack,
            componentStack: errorInfo?.componentStack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.log('Error report:', errorReport);
        
        // Show notification that error was reported
        alert('Error has been reported to our team. Thank you!');
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px',
                        p: 3,
                        backgroundColor: 'background.default'
                    }}
                >
                    <Card 
                        elevation={3} 
                        sx={{ 
                            maxWidth: 600, 
                            width: '100%',
                            textAlign: 'center'
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ mb: 3 }}>
                                <ErrorOutlineIcon 
                                    sx={{ 
                                        fontSize: 80, 
                                        color: 'error.main',
                                        mb: 2
                                    }} 
                                />
                                <Typography variant="h4" fontWeight="bold" color="error" gutterBottom>
                                    Oops! Something went wrong
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    We encountered an unexpected error. Don't worry - your data is safe, 
                                    and our team has been notified.
                                </Typography>
                            </Box>

                            <Stack 
                                direction={{ xs: 'column', sm: 'row' }} 
                                spacing={2} 
                                justifyContent="center"
                                sx={{ mb: 3 }}
                            >
                                <Button
                                    variant="contained"
                                    startIcon={<RefreshIcon />}
                                    onClick={this.handleRetry}
                                    size="large"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<BugReportIcon />}
                                    onClick={this.handleReportError}
                                    size="large"
                                >
                                    Report Issue
                                </Button>
                            </Stack>

                            {process.env.NODE_ENV === 'development' && (
                                <>
                                    <Button
                                        variant="text"
                                        endIcon={this.state.showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        onClick={this.handleToggleDetails}
                                        sx={{ mb: 2 }}
                                    >
                                        {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                                    </Button>

                                    <Collapse in={this.state.showDetails}>
                                        <Alert severity="error" sx={{ textAlign: 'left', mt: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                Error Details (Development Mode)
                                            </Typography>
                                            <Typography variant="body2" component="div">
                                                <strong>Message:</strong><br />
                                                {this.state.error?.message}
                                            </Typography>
                                            {this.state.error?.stack && (
                                                <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                                    <strong>Stack Trace:</strong><br />
                                                    <Box 
                                                        component="pre" 
                                                        sx={{ 
                                                            fontSize: '0.75rem',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                            maxHeight: 200,
                                                            overflow: 'auto',
                                                            bgcolor: 'grey.100',
                                                            p: 1,
                                                            borderRadius: 1,
                                                            mt: 1
                                                        }}
                                                    >
                                                        {this.state.error.stack}
                                                    </Box>
                                                </Typography>
                                            )}
                                            {this.state.errorInfo?.componentStack && (
                                                <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                                    <strong>Component Stack:</strong><br />
                                                    <Box 
                                                        component="pre" 
                                                        sx={{ 
                                                            fontSize: '0.75rem',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                            maxHeight: 200,
                                                            overflow: 'auto',
                                                            bgcolor: 'grey.100',
                                                            p: 1,
                                                            borderRadius: 1,
                                                            mt: 1
                                                        }}
                                                    >
                                                        {this.state.errorInfo.componentStack}
                                                    </Box>
                                                </Typography>
                                            )}
                                        </Alert>
                                    </Collapse>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

// Hook-based error boundary for functional components
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) => {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    
    return WrappedComponent;
};