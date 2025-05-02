// pages/room/[roomId].js

'use client';

import styles from '../TimerClient.module.css';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router'; // Next.jsのuseRouterをインポート

const socket = io('http://localhost:3001');

export default function TimerClient() {
  const [timers, setTimers] = useState({});
  const router = useRouter();
  const { roomId } = router.query; // URLのroomIdパラメータを取得

  const [joinedRoom, setJoinedRoom] = useState(null);

  
  
  useEffect(() => {

      
    socket.on('connect', () => {
    console.log('Connected:', socket.id);
    });
     
    console.log(roomId);

    if (roomId) { // roomIdがある場合にのみソケット接続
      socket.emit('join_room', roomId);
      setJoinedRoom(roomId);

      // 受信イベントの設定
      socket.on('all_timers', (initialTimers) => {

        
        const loadedTimers = {};
        for (const timer of initialTimers) {
          loadedTimers[timer.timerId] = {
            timerId: timer.timerId,
            count: timer.count,
            isRunning: timer.isRunning || false,
            note: timer.note || '',
          };
        }
        setTimers(loadedTimers);
      });

      // その他のイベントも設定...
      socket.on('timer_created', ({ timerId, count, note }) => {
        setTimers((prev) => ({
          ...prev,
          [timerId]: { timerId, count, isRunning: false, note: note || '' }
        }));
      });
  
      socket.on('timer_update', ({ timerId, count }) => {
        setTimers((prev) => ({
          ...prev,
          [timerId]: { ...prev[timerId], count: parseFloat(count) }
        }));
      });
  
      socket.on('timer_status', ({ timerId, isRunning }) => {
        setTimers((prev) => ({
          ...prev,
          [timerId]: { ...prev[timerId], isRunning }
        }));
      });
  
      socket.on('timer_deleted', (timerId) => {
        setTimers((prev) => {
          const updated = { ...prev };
          delete updated[timerId];
          return updated;
        });
      });
  
      socket.on('note_updated', ({ timerId, note }) => {
        setTimers((prev) => ({
          ...prev,
          [timerId]: { ...prev[timerId], note }
        }));
      });
  
      return () => {
        socket.off('all_timers');
        socket.off('timer_created');
        socket.off('timer_update');
        socket.off('timer_status');
        socket.off('timer_deleted');
        socket.off('note_updated');
      };
    }
  }, [roomId]);

  const handleLeaveRoom = () => {
    if (joinedRoom) {
      socket.emit('leave_room', joinedRoom); // サーバーに「部屋出るよ！」って伝える（あれば）
      setJoinedRoom(null); // ローカル状態リセット（任意）
    }
    router.push('/'); // トップページに移動
  }
  
  const handleCreateTimer = () => {
    if (!joinedRoom) return;
    socket.emit('create_timer', { roomId: joinedRoom });
  };

  const handleStart = (timerId) => {
    socket.emit('resume_timer', { roomId: joinedRoom, timerId });
  };

  const handleStop = (timerId) => {
    socket.emit('stop_timer', { roomId: joinedRoom, timerId });
  };

  const handleReset = (timerId) => {
    socket.emit('reset_timer', { roomId: joinedRoom, timerId });
  };

  const handleDelete = (timerId) => {
    socket.emit('delete_timer', { roomId: joinedRoom, timerId });
  };

  const handleNoteChange = (timerId, newNote) => {
    setTimers((prev) => ({
      ...prev,
      [timerId]: { ...prev[timerId], note: newNote },
    }));
    socket.emit('update_note', { roomId: joinedRoom, timerId, note: newNote });
  };


  //時間を秒から時分秒になおす関数


  function FormattedTime(seconds) {
    const totalSeconds = Math.floor(seconds);
    const fractional = (seconds % 1).toFixed(1).substring(1); // ".1" など
  
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
  
    return {
      formatted: `${hours}:${minutes}:${secs}`,
      fractional, // 例: ".1"
    };
  }
  
  




  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Work With Me.</h1>
      
      

      {joinedRoom && (
        <>
          <div className={styles.topBar}>
            <p className={styles.roomId}>Room ID: <strong>{roomId}</strong></p>
            <button onClick={handleLeaveRoom} className={styles.leaveButton}>
              Leave
            </button>
          </div>

          <div>
          <button onClick={handleCreateTimer} className={styles.createButton}>
            Create New Timer
          </button>
          </div>

          <div className={styles.timerList}>
            {Object.values(timers).map((timer) => (
              <div key={timer.timerId} className={styles.timerCard}>
                {/* <p className={styles.timerId}>ID: {timer.timerId}</p> */}
                <input
                  type="text"
                  defaultValue={timer.note}
                  onBlur={(e) => handleNoteChange(timer.timerId, e.target.value)}
                  placeholder="TimerName"
                  className={styles.noteInput}
                />
                
                {/* 時間の部分 */}
                {(() => {
                  const { formatted, fractional } = FormattedTime(timer.count);
                  return (
                    <div className = {styles.TimePart}>
                      <p className={styles.timerCount}>

                        <span className={styles.invisible}>
                          0:00:00.0
                        </span>


                        {formatted}
                        <span className={styles.fraction}>{fractional}</span>
                      </p>
                      {timer.isRunning ? (
                          <div>
                            
                            <img
                              src="/images/walk.gif"
                              alt="STOP3"
                            />
                          </div>
                        ) : (
                          <div>
                            
                            <img
                              src="/images/stop.png"
                              alt="STOP3"
                            />
                          </div>
                        )}
                      {timer.isRunning ? (
                        <div  className={styles.stopButton}>
                          <button onClick={() => handleStop(timer.timerId)} className={styles.stopButton}>
                            <img src="/images/Stopp.png" alt="STOPボタン" />
                          </button>
                        </div>
                      ) : (
                        <div className={styles.startButton}>
                          <button onClick={() => handleStart(timer.timerId)} className={styles.startButton}>
                            <img src="/images/Start.png" alt="STARTボタン" /> 
                          </button>
                        </div>
                      )} 
                      
                    </div>
                  );
                })()}
                <div className={styles.buttonGroup}>
                  <button onClick={() => handleDelete(timer.timerId)} className={styles.deleteButton}>
                    <img src="/images/DELETE.png" alt="DELETEボタン" /> 
                  </button>
                  
                  <button onClick={() => handleReset(timer.timerId)} className={styles.resetButton}>
                    <img src="/images/resetBold.png" alt="RESETボタン" /> 
                  </button>
                  
                </div>
                
              </div>
            ))}
          </div>
        </>
      )}
      <p>(部屋ごとに分けてタイマーを管理できるなり)</p>
      <p>(友達とルームIDを共有して、タイマーを共有できやす!)</p>
    </div>
  );
}
