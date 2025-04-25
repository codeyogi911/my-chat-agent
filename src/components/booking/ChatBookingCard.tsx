import { Calendar } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export interface ChatBookingInfo {
  id?: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  status?: string;
}

// Typing animation CSS class
export const typingAnimationClass = `
  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }

  @keyframes blink {
    from, to { border-color: transparent }
    50% { border-color: currentColor }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .typing-cursor {
    border-right: 2px solid;
    animation: blink 1s step-end infinite;
  }

  .typing-animation {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    animation: typing 1.5s steps(30, end);
  }

  .fade-in {
    opacity: 0;
    animation: fadeIn 0.5s ease-out forwards;
  }

  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .delay-400 { animation-delay: 400ms; }
  .delay-500 { animation-delay: 500ms; }
  .delay-600 { animation-delay: 600ms; }
  .delay-700 { animation-delay: 700ms; }
  .delay-800 { animation-delay: 800ms; }
`;

export const ChatBookingCard = ({ booking }: { booking: ChatBookingInfo }) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [showTypingCursor, setShowTypingCursor] = useState(true);

  // Add animation styles to head on mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = typingAnimationClass;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Sequential animation for booking card fields
  useEffect(() => {
    if (animationStage < 5) {
      const timer = setTimeout(() => {
        setAnimationStage(prev => prev + 1);
      }, 300); // Delay between stages
      
      return () => clearTimeout(timer);
    } else {
      // Remove typing cursor after all fields are shown
      const timer = setTimeout(() => {
        setShowTypingCursor(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [animationStage]);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700 shadow-sm my-2">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} className={`text-[rgb(0,104,120)] fade-in`} />
          <span className={`font-medium text-sm fade-in ${animationStage >= 1 ? 'typing-animation' : 'opacity-0'}`}>
            {booking.title}
            {animationStage === 1 && showTypingCursor && <span className="typing-cursor">&nbsp;</span>}
          </span>
          {booking.status && animationStage >= 5 && (
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full fade-in delay-500 ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
            }`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1 text-xs text-neutral-600 dark:text-neutral-300">
          <div className={`flex items-center fade-in ${animationStage >= 2 ? '' : 'opacity-0'} delay-200`}>
            <span className="font-medium mr-2">Date:</span>
            <span>
              {booking.date}
              {animationStage === 2 && showTypingCursor && <span className="typing-cursor">&nbsp;</span>}
            </span>
          </div>
          
          {booking.time && (
            <div className={`flex items-center fade-in ${animationStage >= 3 ? '' : 'opacity-0'} delay-300`}>
              <span className="font-medium mr-2">Time:</span>
              <span>
                {booking.time}
                {animationStage === 3 && showTypingCursor && <span className="typing-cursor">&nbsp;</span>}
              </span>
            </div>
          )}
          
          {booking.location && (
            <div className={`flex items-center fade-in ${animationStage >= 4 ? '' : 'opacity-0'} delay-400`}>
              <span className="font-medium mr-2">Location:</span>
              <span>
                {booking.location}
                {animationStage === 4 && showTypingCursor && <span className="typing-cursor">&nbsp;</span>}
              </span>
            </div>
          )}
          
          {booking.id && (
            <div className={`flex items-center fade-in ${animationStage >= 5 ? '' : 'opacity-0'} delay-500`}>
              <span className="font-medium mr-2">Booking ID:</span>
              <span className="font-mono">
                {booking.id}
                {animationStage === 5 && showTypingCursor && <span className="typing-cursor">&nbsp;</span>}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Parsing function to extract booking info from markdown text
export const parseBookingInfo = (text: string): ChatBookingInfo[] => {
  const bookings: ChatBookingInfo[] = [];
  
  // Pattern for complete booking blocks
  const completeBookingPattern = /```booking\s+([\s\S]*?)```/g;
  // Pattern for incomplete booking blocks (just started with ```booking)
  const incompleteBookingPattern = /```booking\s+([\s\S]*?)$/;
  
  // Check for complete bookings
  let match;
  while ((match = completeBookingPattern.exec(text)) !== null) {
    const bookingContent = match[1];
    const booking = extractBookingDetails(bookingContent);
    bookings.push(booking);
  }
  
  // Check for incomplete booking at the end of text
  const incompleteMatch = text.match(incompleteBookingPattern);
  if (incompleteMatch && !text.endsWith("```")) {
    const incompleteContent = incompleteMatch[1];
    const booking = extractBookingDetails(incompleteContent);
    booking.status = booking.status || 'pending'; // Mark incomplete bookings as pending
    bookings.push(booking);
  }
  
  return bookings;
};

// Helper function to extract booking details from content
const extractBookingDetails = (content: string): ChatBookingInfo => {
  const lines = content.trim().split('\n');
  
  const booking: ChatBookingInfo = {
    title: 'Booking',
    date: 'Unknown date',
  };
  
  lines.forEach(line => {
    if (line.startsWith('title:')) booking.title = line.slice(6).trim();
    else if (line.startsWith('date:')) booking.date = line.slice(5).trim();
    else if (line.startsWith('time:')) booking.time = line.slice(5).trim();
    else if (line.startsWith('location:')) booking.location = line.slice(9).trim();
    else if (line.startsWith('status:')) booking.status = line.slice(7).trim().toLowerCase();
    else if (line.startsWith('id:')) booking.id = line.slice(3).trim();
  });
  
  return booking;
};

// Function to detect if text contains booking markdown (complete or incomplete)
export const hasBookingMarkdown = (text: string): boolean => {
  const bookingPattern = /```booking\s+/;
  return bookingPattern.test(text);
};

// Function to remove booking markdown from text
export const removeBookingsFromText = (text: string): string => {
  // Remove complete booking blocks
  let cleaned = text.replace(/```booking\s+([\s\S]*?)```/g, '');
  
  // Remove incomplete booking block at the end
  cleaned = cleaned.replace(/```booking\s+([\s\S]*?)$/, '');
  
  return cleaned;
}; 