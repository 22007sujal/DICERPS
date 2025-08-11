"use client"
import React, { useContext } from 'react';
import "./waiting_area.css";
import { SOCKET } from '../[context]/socket_context';
import { useRoomContext } from '../[context]/room_context';
import { useRouter } from 'next/navigation';

export default function page() {

    const socket = useContext(SOCKET);
    const room = useRoomContext();
    const Router = useRouter();


   socket?.on("match_started" , ()=>{
        Router.replace("/room")
    })
   
    socket?.on("match_found", (data)=>{
        room.setRoomId(data.room_id);
    })

    socket?.on("assign_role" , (data)=>{
        room.set_role(data.player)
    })



  return (
    <div id="waiting_container">
       <div id='logo_rps'>
        <img src={"./dicerpslogo.png"}/>
       </div>
         <h1>FINDING OPPONENT FOR YOU..</h1>
    </div>
  )
}
