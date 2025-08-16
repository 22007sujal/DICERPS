"use client";
import React from 'react';
import "./gameover.css";
import { useRoomContext } from '../[context]/room_context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Over() {
    const room = useRoomContext();
    const router = useRouter();
    const isWin = room.winner === room.player_username;

    return (
        isWin ? (
            <div id="over_container">
                <img id="lose" src="https://cdn-icons-png.flaticon.com/128/520/520460.png" alt="Win" />
                <div id="lose_head"><h1>YOU WIN</h1></div>
                
                <div id="winner_info">
                    <p>Winner: {room?.winner ? String(room.winner) : 'Unknown'}</p>
                    <p>THE PRIZE IS: {room?.prize_pool ? String(room.prize_pool) : '0'}</p>
                    <p>TXN HASH: {room?.tx_hash ? <Link href={`https://shannon-explorer.somnia.network/tx/${room.tx_hash}`}>{String(room.tx_hash.slice(0,8))}</Link>: 'Pending...'}</p>
                </div>
                
                <img onClick={()=>{router.replace("/play")}} id="new_game" src="./newgame.png" alt="New Game" />
            </div>
        ) : (
            <div id="over_container">
                <img id="lose" src="./lose.png" alt="Lose" />
                <div id="lose_head"><h1>YOU LOSE</h1></div>
                
                <div id="winner_info">
                    <p>Winner: {room?.winner ? String(room.winner) : 'Unknown'}</p>
                    <p>THE PRIZE IS: {room?.prize_pool ? String(room.prize_pool) : '0'}</p>
                    <p>TXN HASH: {room?.tx_hash ? <Link href={`https://shannon-explorer.somnia.network/tx/${room.tx_hash}`}>{String(room.tx_hash.slice(0,8))}</Link>: 'Pending...'}</p>
                </div>
                
                <img onClick={()=>{router.replace("/play")}} id="new_game" src="./newgame.png" alt="New Game" />
            </div>
        )
    );
}