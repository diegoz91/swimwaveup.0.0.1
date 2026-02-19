// src/utils/errorHandler.ts
import { AppwriteException } from 'appwrite';

interface ErrorLog {
    app: string;
    message: string;
    context: string;
    timestamp: string;
    stack?: string;
    url: string;
}

// Centralized error handling system for debugging
class SwimWaveUpErrorHandler {
  private errors: ErrorLog[] = [];
  private isProduction = process.env.NODE_ENV === 'production';
  private appName = 'SwimWaveUp';

  log(error: Error, context = '') {
    const errorObj: ErrorLog = {
      app: this.appName,
      message: error.message || String(error),
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      url: window.location.href
    };

    this.errors.push(errorObj);
    
    if (!this.isProduction) {
      console.group(`🚨 ${this.appName} Error - ${context}`);
      console.error('Message:', errorObj.message);
      console.error('Time:', errorObj.timestamp);
      console.error('URL:', errorObj.url);
      if (errorObj.stack) console.error('Stack:', errorObj.stack);
      console.groupEnd();
    }

    if (this.isProduction) {
      this.sendToLoggingService(errorObj);
    }
  }

  logAppwriteError(error: AppwriteException | Error, operation: string) {
    const context = `Appwrite ${operation}`;
    
    if (error instanceof AppwriteException) {
      console.group(`🔧 ${this.appName} Appwrite Error - ${operation}`);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Type:', error.type);
      console.error('Response:', error.response);
      console.groupEnd();
      this.suggestFix(error.code);
    }

    this.log(error, context);
  }

  private suggestFix(errorCode: number) {
    const suggestions: {[key: number]: string} = {
      401: '🔐 Authentication problem - Check login/session status.',
      403: '🚫 Insufficient permissions - Check collection permissions.',
      404: '🔍 Resource not found - Verify collection/document ID.',
      429: '⏰ Rate limit exceeded - Too many requests, slow down.',
      500: '🔧 Appwrite server error - Try again shortly.'
    };

    if (suggestions[errorCode]) {
      console.warn(`💡 ${this.appName} Suggestion:`, suggestions[errorCode]);
    }
  }
  
  logRegistrationError(error: Error, userType: string) {
    this.log(error, `Registration-${userType}`);
  }

  logJobApplicationError(error: Error, jobId: string) {
    this.log(error, `JobApplication-${jobId}`);
  }

  logChatError(error: Error, conversationId: string) {
    this.log(error, `Chat-${conversationId}`);
  }

  getRecentErrors(limit = 10): ErrorLog[] {
    return this.errors.slice(-limit);
  }

  clearErrors() {
    this.errors = [];
    console.log(`🧹 ${this.appName} errors cleared`);
  }

  private sendToLoggingService(errorObj: ErrorLog) {
    // Implement sending to an external logging service for SwimWaveUp
    console.log('📊 Sending to logging service:', errorObj);
  }
}

export const errorHandler = new SwimWaveUpErrorHandler();

// Hook for React component debugging in SwimWaveUp
export const useErrorHandler = () => {
  return { 
    logError: (error: Error, context: string) => errorHandler.log(error, context), 
    logAppwriteError: (error: AppwriteException | Error, operation: string) => errorHandler.logAppwriteError(error, operation),
    logRegistrationError: (error: Error, userType: string) => errorHandler.logRegistrationError(error, userType),
    logJobApplicationError: (error: Error, jobId: string) => errorHandler.logJobApplicationError(error, jobId)
  };
};