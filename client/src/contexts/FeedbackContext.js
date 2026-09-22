import React from 'react';

const FeedbackContext = React.createContext({
    setFeedback: () => {},
    setFeedbackFromError: () => {},
});

export default FeedbackContext;