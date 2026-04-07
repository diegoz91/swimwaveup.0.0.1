import { AppwriteException } from 'appwrite';

interface ErrorLog {
    app: string;
    message: string;
    context: string;
    timestamp: string;
    stack?: string;
    url: string;
}

class SwimWaveUpErrorHandler {
  private errors: ErrorLog[] = [];
  private isProduction = import.meta.env.PROD;
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
      console.group(`🔧 ${this.appName} Appwrite Error`);
      console.error(`[${error.code}] ${error.type}`);
      console.error(error.message);
      console.groupEnd();
    }

    this.log(error, context);
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
    if (!this.isProduction) {
      console.log(`🧹 ${this.appName} errors cleared`);
    }
  }

  private sendToLoggingService(errorObj: ErrorLog) {
    console.error(`[Production Error Log | ${errorObj.context}]`, errorObj.message, errorObj.url);
  }
}

export const errorHandler = new SwimWaveUpErrorHandler();

export const useErrorHandler = () => {
  return { 
    logError: (error: Error, context: string) => errorHandler.log(error, context), 
    logAppwriteError: (error: AppwriteException | Error, operation: string) => errorHandler.logAppwriteError(error, operation),
    logRegistrationError: (error: Error, userType: string) => errorHandler.logRegistrationError(error, userType),
    logJobApplicationError: (error: Error, jobId: string) => errorHandler.logJobApplicationError(error, jobId),
    logChatError: (error: Error, conversationId: string) => errorHandler.logChatError(error, conversationId)
  };
};