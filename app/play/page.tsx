"use client"
import React, { useContext } from 'react';
import "./play.css"
import { SOCKET } from '../[context]/socket_context';
import { useRouter } from 'next/navigation';
import { useRoomContext } from '../[context]/room_context';



export default function Page() {

     const socket = useContext(SOCKET);
     const router = useRouter();
   
    function Joinred() {
        socket?.emit("find_match" , "RED")
        router.replace("/waiting_area")
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