import { UserButton } from "@stackframe/stack";
import  Image  from "next/image";
import React from "react";

function AppHeader(){
    return (
        <div className='p-3 shadow-sm flex justify-between items-center'>
            <Image src ={'/logo.png'} alt='logo' width={180} height={180}/>
            <UserButton/>
        </div>
    )
}

export default AppHeader;