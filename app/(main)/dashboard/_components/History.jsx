"use client";
import React, { useContext, useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UserContext } from "../../../_context/UserContext";
import CoachingOptions from "../../../../services/Options";
import Image from "next/image";
import moment from "moment";
import Link from "next/link";


function History() {
    const convex = useConvex();
    const { userData } = useContext(UserContext);
    const [discussionRoomList, setDiscussionRoomList] = useState([]);

    useEffect(() => {
        if (userData) {
            GetDiscussionRooms();
        }
    }, [userData]);

    const GetDiscussionRooms = async () => {
        const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom, {
            uid: userData._id,
        });
        console.log(result);
        setDiscussionRoomList(result);
    };

    const GetAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find((item) => item.name === option);
        return coachingOption?.abstract ?? '/ab1.png';
    }



    return (
        <div>
            <h2 className="font-bold text-xl">Your Previous Lectures</h2>

            {discussionRoomList?.length === 0 && (
                <h2>You don't have any previous lecture</h2>
            )}

            <div className='mt-5'>
                {discussionRoomList.map(
                    (item, index) =>
                        (item.coachingOption === "Lecture on Topic" ||
                            item.coachingOption === "Languages Skill" ||
                            item.coachingOption === "Meditation Expert ") && (
                            <div key={index} className='border-b-[1px] pb-3 mb-4 group flex justify-between items-center cursor-pointer'>
                                <div className='flex gap-7 items-center'>
                                    <Image src={GetAbstractImages(item.coachingOption)} alt='abstract image' width={70} height={70} className='rounded-full h-[50px] w-[50px]' />
                                    <div>
                                        <h2 className="font-semibold text-lg">{item.topic}</h2>
                                        <p className="text-sm text-gray-600">{item.coachingOption}</p>
                                        <p className="text-gray-400 text-sm">{moment (item._creationTime).fromNow()}</p>
                                    </div>

                                </div>
                                <Link href={'view-summary/' + item._id}>
                                <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition duration-200 invisible group-hover:visible">View Notes</button>
                                 </Link>
                            </div>
                        )
                )}
            </div>
        </div>
    );
}

export default History;
