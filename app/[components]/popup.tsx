"use client"
import React from 'react'
import "./pop.css"
import { useRoomContext } from '../[context]/room_context'
import { Players } from '../room/page'


export interface pop_up_data {
    Player1:Players,
    Player2:Players,
    winner: string,
    round: number,
    is_closed: boolean
}

export default function Pop_up(pop_up_data: pop_up_data) {
    const room = useRoomContext();
    
    // Determine winner's profile image
    const getWinnerProfileImage = () => {
        if (pop_up_data.winner === room.player_username) {
            return room.player_profile_image_link as string;
        } else {
            return room.profile_link as string;
        }
    };

    // Determine winner CSS class for styling
    const getWinnerClass = () => {
        if (pop_up_data.winner === room.player_username) {
            return 'player-win';
        } else if (pop_up_data.winner === 'Tie' || pop_up_data.winner === 'Draw') {
            return 'tie';
        } else {
            return 'computer-win';
        }
    };

   ;

    return (
        <div id='pop_up_container' style={{ display: pop_up_data.is_closed ? 'none' : 'flex' }}>
            <div id='pop_up_card'>
                <div id='round'>
                    <p>ROUND : {pop_up_data.round}</p>
                </div>
                
                <img src={getWinnerProfileImage()} alt="Winner Profile" />
                
                <div id='winner_name' className={getWinnerClass()}>
                    <p>{pop_up_data.winner===room.role?room.player_username:room.enemy}🎉🎉</p>
                </div>
                
                <div id="current-score">
                    <div className={pop_up_data.Player1.username === room.player_username ? 'player-score' : 'computer-score'}>
                        {pop_up_data.Player1.username.toString()} - {pop_up_data.Player1.wins}
                    </div>
                    
                    <div className="vs-text">VS</div>
                    
                    <div className={pop_up_data.Player2.username === room.player_username ? 'player-score' : 'computer-score'}>
                        {pop_up_data.Player2.username.toString()} - {pop_up_data.Player2.wins}
                    </div>
                </div>
            </div>
        </div>
    )
}