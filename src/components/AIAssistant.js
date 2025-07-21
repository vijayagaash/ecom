import React, { useState, useEffect } from 'react';
import AIChatButton from './AIChatButton';
import AIChatbox from './AIChatbox';

const AIAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has interacted with chat before
    const interacted = localStorage.getItem('ai-chat-interacted');
    if (interacted) {
      setHasInteracted(true);
    }
  }, []);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    if (!hasInteracted) {
      setHasInteracted(true);
      localStorage.setItem('ai-chat-interacted', 'true');
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <AIChatButton 
        onClick={handleOpenChat}
        hasInteracted={hasInteracted}
      />
      <AIChatbox 
        isOpen={isChatOpen}
        onClose={handleCloseChat}
      />
    </>
  );
};

export default AIAssistant;
