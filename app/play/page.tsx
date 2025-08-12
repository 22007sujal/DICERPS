"use client"
import React, { useContext, useEffect } from 'react';
import "./play.css"
import { SOCKET } from '../[context]/socket_context';
import { useRouter } from 'next/navigation';
import { useRoomContext } from '../[context]/room_context';
import { useWriteContract } from 'wagmi';
import { abi } from '../[utility]/abi';
import { parseEther } from 'viem';



export default function Page() {

     const socket = useContext(SOCKET);
     const contract = useWriteContract();
     const router = useRouter();


    const { data: hash, writeContract } = useWriteContract()



   
   async function Joinred() {
        socket?.emit("find_match" , "RED")
        // writeContract({
        //     abi:abi,
        //     address:"0x4EA3a9b291E02c7fC622451DdDb4E5479509e5cf",
        //     functionName:"joinGame",
        //     args:[1],
        //     value:parseEther("0.2")

        // })
        router.replace("/waiting_area");
    }


     
   
   
   
    return (
       <div id="play-container">

        <div id='ticket-container'>

       <div id="YELLOW"><img src={"./yellow_ticket.png"}/></div>
        <div id="BLUE"><img src={"./blue_ticket.png"}/></div>
        <div id="RED" onClick={Joinred}><img src={"./red_ticket.png"}/></div>
        


        </div>

        <div id='howto'><h1>HOW TO PLAY</h1></div>

       </div>
    )
}