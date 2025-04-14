"use client"
import React from 'react';
import { BlurFade } from '../../../../components/magicui/blur-fade';
import { useUser } from '@stackframe/stack';
import CoachingOptions from '../../../../services/Options';
import Image from 'next/image';
import UserInputDialog from './UserInputDialog';
import ProfileDialog from './ProfileDialog';

function FeatureAssistants() {
    const user = useUser();

    // Ensure CoachingOptions is an array before mapping
    const options = Array.isArray(CoachingOptions) ? CoachingOptions : [];

    return (
        <div>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='font-medium text-gray-500'>My Workspace</h2>
                    <h2 className='text-3xl font-bold'>Welcome back, {user?.displayName || "Guest"}</h2>
                </div>
                <ProfileDialog>
                <button
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#007BFF", // Primary Blue
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        transition: "background 0.3s",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")} // Darker Blue on hover
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#007BFF")}
                >
                    Profile
                </button>
                </ProfileDialog>
                
            </div>
            <div className='grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-10 mt-10'>
                {options.length > 0 ? (
                    options.map((option, index) => (
                        <BlurFade key={option.icon} delay={0.25 + index * 0.05} inView>
                            <UserInputDialog coachingOption={option}>
                                <div key={index} className='p-3 bg-secondary rounded-3xl flex flex-col justify-center items-center'>
                                    <Image 
                                        src={option.icon} 
                                        alt={option.name}
                                        width={150}
                                        height={150}
                                        className='h-[70px] w-[70px] hover:rotate-12 cursor-pointer transition-all'
                                    />
                                    <h2 className='mt-2'>{option.name}</h2>
                                </div>
                            </UserInputDialog>
                        </BlurFade>
                    ))
                ) : (
                    <p className="col-span-5 text-center text-gray-500">No options available</p>
                )}
            </div>
        </div>
    );
}

export default FeatureAssistants;
