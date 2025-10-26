import React from 'react';

interface StatusDisplayProps {
    message: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ message }) => {
    return (
        <div className="text-xl font-semibold text-center text-gray-700 mb-6 min-h-8 flex items-center justify-center">
            {message}
        </div>
    );
};

export default StatusDisplay;