import React from "react";

const ErrorMsg = ({ message }: { message: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-destructive">Error</h1>

        <p className="noir-text text-destructive mt-2">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMsg;
