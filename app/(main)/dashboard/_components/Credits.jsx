import Image from 'next/image';
import React, { useContext } from 'react';
import { UserContext } from '../../../_context/UserContext';
import { useUser } from '@stackframe/stack';

function Credits() {
    const { userData } = useContext(UserContext);  // Data from context
    const user = useUser();  // Hook from stackframe (if needed, you can choose one data source)

    const displayName = user?.displayName || userData?.displayName || 'Guest User';
    const primaryEmail = user?.primaryEmail || userData?.primaryEmail || 'No email provided';
    const profileImageUrl = user?.profileImageUrl || userData?.profileImageUrl || '/default-profile.jpg';

    return (
        <div>
            <div className='flex gap-5 items-center'>
                <Image 
                    src={profileImageUrl} 
                    width={60} 
                    height={60} 
                    alt='profile img'
                    className='rounded-full'
                />
                <div>
                    <h3 className='text-lg font-bold'>{displayName}</h3>
                    <h4 className='text-gray-500'>{primaryEmail}</h4> {/* Changed h2 to h4 for semantic purpose */}
                </div>
            </div>
            <hr className='my-3' />
        </div>
    );
}

export default Credits;
