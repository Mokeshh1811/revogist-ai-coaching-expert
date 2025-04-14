"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { CoachingExpert } from "../../../../services/Options";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import {
  AIModel,
  AIModelToGenerateFeedbackAndNotes,
  ConvertTextToSpeech,
} from "../../../../services/GlobalServices";
import { toast } from "sonner";
import Webcam from "react-webcam";


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
  const [enableFeedbackNotes, setEnableFeedbackNotes] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const UpdateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
  const updateSummary=useMutation(api.DiscussionRoom.UpdateSummary);



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

    setEnableMic(true);
    enableMicRef.current = true;

    if (!("webkitSpeechRecognition" in window)) {
      alert(
        "Your browser does not support Speech Recognition. Try using Google Chrome."
      );
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;
    isRecognitionActive.current = true;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = async (event) => {
      if (isSpeaking.current) return;

      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";

        if (event.results[i].isFinal) {
          const userMessage = transcript.trim();

          setConversation((prev) => [
            ...prev,
            { role: "user", content: userMessage },
          ]);

          try {
            const aiResponse = await AIModel(
              DiscussionRoomData?.topic || "general",
              DiscussionRoomData?.coachingOption || "Motivation",
              userMessage
            );

            setConversation((prev) => [
              ...prev,
              { role: "assistant", content: aiResponse },
            ]);

            try {
              isSpeaking.current = true;
              recognition.stop();
              isRecognitionActive.current = false;

              const audioUrl = await ConvertTextToSpeech(
                aiResponse,
                expert?.voice || DiscussionRoomData.expertName
              );
              const audio = new Audio(audioUrl);
              audio.onended = () => {
                isSpeaking.current = false;
                if (enableMicRef.current) {
                  recognition.start();
                  isRecognitionActive.current = true;
                }
              };
              audio.play();
            } catch (e) {
              console.error("Speech playback failed:", e);
              isSpeaking.current = false;
            }
          } catch (err) {
            console.error("AI Error:", err);
          }

          transcript = "";
        }
      }

      setTranscribe(transcript);
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
      conversation: conversation,
    });

    setEnableFeedbackNotes(true);
  };

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

      <div className="mt-6 p-4 border rounded-lg bg-white shadow-md">
        <h2>{transcribe}</h2>
      </div>
    </div>
  );
}

export default DiscussionRoom;
