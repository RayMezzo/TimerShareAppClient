'use client';

import styles from './TimerClient.module.css'; // ←CSSファイルを読み込む

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');
//ここは、
//const socket = io("実際に使うURL"|| 'http://localhost:3001');
//っていう風にしてもいいかも。


//exportは外部ファイルにこの関数を公開するやつ
//defaultは他のファイルでimportしたときに、名前を自由に変更できるようにするやつ
export default function TimerClient() {
  const [roomId, setRoomId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState(null); // 現在参加中のルームID
  const [timers, setTimers] = useState({});

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected:', socket.id);
    });

    // 部屋に参加したときに、部屋に関連するタイマー情報を受け取る
    socket.on('all_timers', (initialTimers) => {
      console.log('受信したタイマー一覧:', initialTimers);
      
      const loadedTimers = {};
      for (const timer of initialTimers) {
        loadedTimers[timer.timerId] = {
          timerId: timer.timerId,
          count: timer.count,
          isRunning: timer.isRunning || false,
          note: timer.note || ''
        };
      }
      setTimers(loadedTimers);
    });
    

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
  }, []);

  const handleJoinRoom = () => {
    if (!roomId) return;
    socket.emit('join_room', roomId);
    setJoinedRoom(roomId);
  };

  const handleLeaveRoom = () => {
    socket.emit('leave_room', joinedRoom);
    setJoinedRoom(null);
    setTimers({}); // タイマー情報リセット
  };

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
      [timerId]: { ...prev[timerId], note: newNote }
    }));
    socket.emit('update_note', { roomId: joinedRoom, timerId, note: newNote });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>リアルタイムタイマー</h1>
      <p>(部屋ごとに分けてタイマーを管理できるなり)</p>
      <p>(友達とルームIDを共有して、タイマーを共有できやす!)</p>
  
      {joinedRoom ? (
        <div className={styles.roomInfo}>
          <p className={styles.roomText}>参加中のルームID: <strong>{joinedRoom}</strong></p>
          <button onClick={handleLeaveRoom} className={styles.leaveButton}>
            退出
          </button>
        </div>
      ) : (
        <div className={styles.joinForm}>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="ルームIDを入力"
            className={styles.input}
          />
          <button onClick={handleJoinRoom} className={styles.joinButton}>
            JOIN
          </button>
        </div>
      )}
  
      {joinedRoom && (
        <>
          <button
            onClick={handleCreateTimer}
            className={styles.createButton}
          >
            タイマーを作成
          </button>
  
          <div className={styles.timerList}>
            {Object.values(timers).map((timer) => (
              <div key={timer.timerId} className={styles.timerCard}>
                <p className={styles.timerId}>
                  ID: {timer.timerId}
                </p>
                <input
                  type="text"
                  defaultValue={timer.note}
                  onBlur={(e) => handleNoteChange(timer.timerId, e.target.value)}
                  placeholder="このタイマーの用途（メモ）"
                  className={styles.noteInput}
                />
                <p className={styles.timerCount}>{timer.count.toFixed(1)} 秒</p>
                <div className={styles.buttonGroup}>
                  {timer.isRunning ? (
                    <button onClick={() => handleStop(timer.timerId)} className={styles.stopButton}>
                      停止
                    </button>
                  ) : (
                    <button onClick={() => handleStart(timer.timerId)} className={styles.startButton}>
                      開始
                    </button>
                  )}
                  <button onClick={() => handleReset(timer.timerId)} className={styles.resetButton}>
                    リセット
                  </button>
                  <button onClick={() => handleDelete(timer.timerId)} className={styles.deleteButton}>
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
  
}

