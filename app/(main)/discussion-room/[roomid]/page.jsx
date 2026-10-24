"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { CoachingExpert } from "../../../../services/Options";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import { toast } from "sonner";
import Webcam from "react-webcam";

async function AIModel(topic, coachingOption, msg, previousMessages = []) {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, coachingOption, msg, previousMessages }),
  });
  const { message } = await res.json();
  return message;
}

async function AIModelToGenerateFeedbackAndNotes(coachingOption, conversation) {
  const res = await fetch("/api/ai/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coachingOption, conversation }),
  });
  return res.json();
}

async function ConvertTextToSpeech(text, expertName) {
  const res = await fetch("/api/ai/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, expertName }),
  });
  if (!res.ok) return null;
  const audioBlob = await res.blob();
  return URL.createObjectURL(audioBlob);
}


const SILENCE_DEBOUNCE_MS = 1200;

function DiscussionRoom() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });

  const [expert, setExpert] = useState(null);
  const [enableMic, setEnableMic] = useState(false);
  const enableMicRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognitionActive = useRef(false);
  const isSpeaking = useRef(false);
  const [transcribe, setTranscribe] = useState("");
  const [conversation, setConversation] = useState([]);
  const conversationRef = useRef([]);
  const finalTranscriptRef = useRef("");
  const silenceTimerRef = useRef(null);
  const [enableFeedbackNotes, setEnableFeedbackNotes] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const UpdateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
  const updateSummary=useMutation(api.DiscussionRoom.UpdateSummary);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);



  const GenerateFeedbackNotes = async () => {
    setIsLoadingFeedback(true);
    try {
      const result = await AIModelToGenerateFeedbackAndNotes(
        DiscussionRoomData?.coachingOption,
        conversation
      );
      console.log(result.content);
      // You can store or display the result as needed here
      await updateSummary({
        id:roomid,
        summary:result.content
      })
      toast('Feedback/Notes generated successfully!' )
  
    } catch (error) {
      console.error("Error generating feedback/notes:", error);
      toast.error("Error generating feedback/notes: " + error.message);
    } finally {
      setIsLoadingFeedback(false);
      
    }
    


  };

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(
        (item) => item.name === DiscussionRoomData.expertName
      );
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  const connectToServer = () => {
    if (enableMicRef.current || isRecognitionActive.current) return;

    if (!("webkitSpeechRecognition" in window)) {
      alert(
        "Your browser does not support Speech Recognition. Try using Google Chrome."
      );
      return;
    }

    setEnableMic(true);
    enableMicRef.current = true;

    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;
    isRecognitionActive.current = true;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Mobile speech recognition often fires several "final" results for a
    // single spoken sentence (one per short pause between words). We buffer
    // every final chunk and only treat the turn as complete once there has
    // been a real pause in speech, so one utterance becomes one message.
    const commitTurn = async () => {
      const userMessage = finalTranscriptRef.current.trim();
      finalTranscriptRef.current = "";
      setTranscribe("");

      if (!userMessage || isSpeaking.current) return;

      setConversation((prev) => [...prev, { role: "user", content: userMessage }]);

      isSpeaking.current = true;
      recognition.stop();
      isRecognitionActive.current = false;

      const resumeListening = () => {
        isSpeaking.current = false;
        if (enableMicRef.current) {
          recognition.start();
          isRecognitionActive.current = true;
        }
      };

      try {
        const aiResponse = await AIModel(
          DiscussionRoomData?.topic || "general",
          DiscussionRoomData?.coachingOption || "Motivation",
          userMessage,
          conversationRef.current
        );

        setConversation((prev) => [...prev, { role: "assistant", content: aiResponse }]);

        const audioUrl = await ConvertTextToSpeech(
          aiResponse,
          expert?.voice || DiscussionRoomData.expertName
        );

        if (!audioUrl) {
          resumeListening();
          return;
        }

        const audio = new Audio(audioUrl);
        audio.onended = resumeListening;
        audio.onerror = resumeListening;
        audio.play();
      } catch (err) {
        console.error("AI Error:", err);
        resumeListening();
      }
    };

    recognition.onresult = (event) => {
      if (isSpeaking.current) return;

      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += text + " ";
        } else {
          interimText += text;
        }
      }

      setTranscribe((finalTranscriptRef.current + interimText).trim());

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(commitTurn, SILENCE_DEBOUNCE_MS);
    };

    recognition.onerror = () => {
      isRecognitionActive.current = false;
      if (enableMicRef.current && !isSpeaking.current) {
        recognition.start();
        isRecognitionActive.current = true;
      }
    };

    recognition.onend = () => {
      isRecognitionActive.current = false;
      if (enableMicRef.current && !isSpeaking.current) {
        recognition.start();
        isRecognitionActive.current = true;
      }
    };

    recognition.start();
  };

  const disconnect = async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    finalTranscriptRef.current = "";
    setTranscribe("");

    setEnableMic(false);
    enableMicRef.current = false;
    isRecognitionActive.current = false;
    isSpeaking.current = false;

    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;

      recognitionRef.current.stop();
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    await UpdateConversation({
      id: DiscussionRoomData._id,
      conversation: conversationRef.current,
    });

    setEnableFeedbackNotes(true);
  };

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  return (
    <div className="-mt-12">
      <h2 className="text-lg font-bold">
        {DiscussionRoomData?.coachingOption}
      </h2>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="lg:col-span-2 h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            <Image
              src={expert?.avatar || "/default-avatar.png"}
              alt="Avatar"
              width={80}
              height={80}
              className="h-[80px] w-[80px] rounded-full object-cover animate-pulse"
            />
            <h2 className="text-gray-500">{expert?.name}</h2>
            {/* <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
              <UserButton />
            </div> */}
            <div className="absolute bottom-10 right-10">
              <Webcam height={100}
              width={150}
              className="rounded-2xl"/>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center">
            {!enableMic ? (
              <button
                onClick={connectToServer}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Connect
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="h-[60vh] bg-secondary border rounded-4xl p-4 overflow-y-scroll">
            <h2 className="text-lg font-semibold mb-2">Chat Section</h2>
            {conversation?.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <p
                  className={`inline-block px-4 py-2 rounded-lg ${
                    msg.role === "user" ? "bg-blue-100" : "bg-gray-200"
                  }`}
                >
                  <strong>
                    {msg.role === "user" ? "You" : expert?.name || "AI"}:
                  </strong>{" "}
                  {msg.content}
                </p>
              </div>
            ))}
          </div>

          {!enableFeedbackNotes ? (
            <h2 className="mt-4 text-gray-400 text-sm">
              At the end of your session, we will automatically generate
              feedback/notes from your conversation.
            </h2>
          ) : (
            <button
            className='mt-7 w-full'
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: isLoadingFeedback ? "#6c757d" : "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: isLoadingFeedback ? "not-allowed" : "pointer",
                transition: "background 0.3s",
              }}
              onClick={GenerateFeedbackNotes}
              disabled={isLoadingFeedback}
            >
              {isLoadingFeedback ? "Generating..." : "Generate Feedback/Notes"}
            </button>
          )}
        </div>
      </div>

      {enableMic && (
        <div className="mt-6 p-4 border rounded-lg bg-white shadow-md min-h-[56px] flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <h2 className="text-gray-700">
            {transcribe || "Listening..."}
          </h2>
        </div>
      )}
    </div>
  );
}

export default DiscussionRoom;
