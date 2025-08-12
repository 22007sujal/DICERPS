"use client"
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { Connector, CreateConnectorFn, useAccount, useConnect } from 'wagmi'

export default function HOME() {

   const {connect , connectors} = useConnect();
   const {isConnected} = useAccount();
   const router = useRouter();
   const firstRender = useRef(true);


   const [connector , set_connector] = useState<Connector<CreateConnectorFn>|null>(null)

   useEffect(()=>{
      set_connector(connectors[1])
   } , [])


   useEffect(()=>{
    if(firstRender.current === true) {
      firstRender.current= false;
      return;
    }
       router.replace("/play");
       
   } , [isConnected])

 

  return (
    <div id="main-container">
       <div id='wallet-connect'>
          <h2 onClick={()=>{if(connector){connect({connector})}}}>CONNECT</h2>
       </div>
        <div id="credits">
          <div id="shy"><p>BUILT BY SUJAL</p></div>
          <div id="how"><p>HOW TO PLAY</p></div>
        </div>
    </div>
  )
}
