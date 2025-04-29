import React from 'react';

const Loading = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
    </div>
  );
};

export default Loading;
