"use client";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import CoachingOptions from "../../../../services/Options";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";

function ViewSummary() {
  const { roomid } = useParams();
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });

  const GetAbstractImages = (option) => {
    const coachingOption = CoachingOptions.find(
      (item) => item.name === option
    );
    return coachingOption?.abstract ?? "/ab1.png";
  };

  const conversation = DiscussionRoomData?.conversation || [];

  // Function to download feedback as PDF
  const downloadPDF = (e) => {
    e.preventDefault(); // Prevents page reload

    const doc = new jsPDF();
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;

    // Title and Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("AI Feedback / Notes", margin, 20);

    // Adding Notes/Feedback Content
    const feedbackContent = DiscussionRoomData?.summary || "No feedback available.";
    const feedbackLines = doc.splitTextToSize(feedbackContent, doc.internal.pageSize.width - 2 * margin);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(feedbackLines, margin, 30); // Adjust Y position for the feedback

    let currentY = 30 + feedbackLines.length * 10 + 10; // Space after feedback content

    // Add space between feedback and conversation
    doc.addPage();
    doc.setFontSize(18);
    doc.text("Conversation", margin, 20);

    // Adding Conversation Content
    conversation.forEach((msg, index) => {
      const messageText = `${msg.role === "user" ? "You" : "Coach"}: ${msg.content}`;
      const messageLines = doc.splitTextToSize(messageText, doc.internal.pageSize.width - 2 * margin);

      doc.setFontSize(12);
      if (msg.role === "user") {
        doc.setTextColor(0, 0, 255); // Blue text for user
      } else {
        doc.setTextColor(100, 100, 100); // Gray text for coach
      }

      doc.text(messageLines, margin, currentY);
      currentY += messageLines.length * 10 + 5; // Move down for the next message
    });

    // Save the PDF
    doc.save("feedback_notes.pdf");
  };

  return (
    <div className="p-6 space-y-6 -mt-15">
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex gap-7 items-center">
          <Image
            src={GetAbstractImages(DiscussionRoomData?.coachingOption)}
            alt="abstract image"
            width={100}
            height={100}
            className="rounded-full h-[70px] w-[70px]"
          />
          <div>
            <h2 className="font-bold text-lg">{DiscussionRoomData?.topic}</h2>
            <p className="text-sm text-gray-600">
              {DiscussionRoomData?.coachingOption}
            </p>
          </div>
        </div>
        <h2 className="text-gray-400 text-sm">
          {moment(DiscussionRoomData?._creationTime).fromNow()}
        </h2>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Section */}
        <div className="flex flex-col gap-2 mt-5">
          <h3 className="text-lg font-bold text-blue-700">AI Feedback / Notes</h3>
          <div className="bg-white border shadow rounded-xl p-5 h-[70vh] overflow-y-auto">
            {DiscussionRoomData?.summary ? (
              <ReactMarkdown className="prose max-w-none text-gray-800">
                {DiscussionRoomData.summary}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">No feedback available.</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-2 mt-5">
          <h3 className="text-lg font-bold text-blue-700">Conversation</h3>
          <div className="bg-white border shadow rounded-xl p-5 h-[70vh] overflow-y-auto">
            {conversation.length > 0 ? (
              conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p>
                      <strong>
                        {msg.role === "user"
                          ? "You"
                          : DiscussionRoomData?.expertName || "Coach"}
                        :
                      </strong>{" "}
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No conversation found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={downloadPDF}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
        >
          Download Notes as PDF
        </button>
      </div>
    </div>
  );
}

export default ViewSummary;
